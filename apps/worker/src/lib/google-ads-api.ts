import {
  formatGoogleAdsLogLine,
  formatGoogleAdsUserMessage,
  googleAdsLoginHeaders,
  isGoogleAdsInvalidGrant,
  isGoogleAdsTwoFactorMessage,
  parseGoogleAdsErrorResponse,
  type GoogleAdsMutatePort,
  type GoogleAdsParsedError,
  type GoogleAdsStructuredDraft,
} from '@marketingspa/shared';

export class GoogleAdsRateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number,
    public readonly parsed?: GoogleAdsParsedError,
  ) {
    super(message);
    this.name = 'GoogleAdsRateLimitError';
  }
}

export class GoogleAdsTokenExpiredError extends Error {
  constructor(
    message: string,
    public readonly parsed?: GoogleAdsParsedError,
  ) {
    super(message);
    this.name = 'GoogleAdsTokenExpiredError';
  }
}

export class GoogleAdsTwoFactorError extends Error {
  constructor(
    message: string,
    public readonly parsed?: GoogleAdsParsedError,
  ) {
    super(message);
    this.name = 'GoogleAdsTwoFactorError';
  }
}

export class GoogleAdsPermissionError extends Error {
  constructor(
    message: string,
    public readonly parsed?: GoogleAdsParsedError,
  ) {
    super(message);
    this.name = 'GoogleAdsPermissionError';
  }
}

function apiVersion() {
  return process.env.GOOGLE_ADS_API_VERSION ?? 'v22';
}

function developerToken() {
  const t = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!t) throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN chưa cấu hình');
  return t;
}

function clientId() {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error('GOOGLE_CLIENT_ID chưa cấu hình');
  return id;
}

function clientSecret() {
  const s = process.env.GOOGLE_CLIENT_SECRET;
  if (!s) throw new Error('GOOGLE_CLIENT_SECRET chưa cấu hình');
  return s;
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: clientId(),
    client_secret: clientSecret(),
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
  });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !json.access_token) {
    const msg = json.error_description ?? json.error ?? 'oauth_refresh_failed';
    if (isGoogleAdsInvalidGrant(json.error, json.error_description)) {
      throw new GoogleAdsTokenExpiredError('Google refresh token hết hạn hoặc bị thu hồi');
    }
    throw new Error(msg);
  }
  return json.access_token;
}

async function adsSearch(
  accessToken: string,
  customerId: string,
  query: string,
  loginCustomerId: string | null,
  timeoutMs: number,
): Promise<Record<string, unknown>[]> {
  const cid = customerId.replace(/-/g, '');
  const rows: Record<string, unknown>[] = [];
  let pageToken: string | undefined;
  do {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(
        `https://googleads.googleapis.com/${apiVersion()}/customers/${cid}/googleAds:search`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'developer-token': developerToken(),
            ...googleAdsLoginHeaders(cid, loginCustomerId),
          },
          body: JSON.stringify({ query, ...(pageToken ? { pageToken } : {}) }),
          signal: controller.signal,
        },
      );
      const text = await res.text();
      let body: {
        results?: Record<string, unknown>[];
        nextPageToken?: string;
        error?: { message?: string; status?: string; details?: unknown[] };
      };
      try {
        body = JSON.parse(text) as typeof body;
      } catch {
        throwNormalized(res.status, {
          error: {
            status: res.status === 404 ? 'NOT_FOUND' : 'UNKNOWN',
            message: `Google Ads non-JSON response (${res.status})`,
          },
        }, res.headers);
      }
      if (!res.ok || body.error) {
        throwNormalized(res.status, body, res.headers);
      }
      if (body.results?.length) rows.push(...body.results);
      pageToken = body.nextPageToken;
    } finally {
      clearTimeout(timer);
    }
  } while (pageToken);
  return rows;
}

function throwNormalized(
  status: number,
  body: { error?: { message?: string; status?: string; details?: unknown[] } },
  headers: Headers,
): never {
  const parsed = parseGoogleAdsErrorResponse({
    httpStatus: status,
    body,
    requestIdHeader: headers.get('request-id') ?? headers.get('x-request-id'),
  });
  // Structured log — never includes tokens
  console.warn(`[google-ads] ${formatGoogleAdsLogLine(parsed, apiVersion())}`);

  const userMsg = formatGoogleAdsUserMessage(parsed);
  if (
    parsed.classification === 'two_factor' ||
    isGoogleAdsTwoFactorMessage(parsed.message) ||
    isGoogleAdsTwoFactorMessage(parsed.errorCode ?? '')
  ) {
    throw new GoogleAdsTwoFactorError(
      'Tài khoản Google Ads yêu cầu xác minh 2 bước — bật 2FA rồi kết nối lại',
      parsed,
    );
  }
  if (parsed.classification === 'rate_limit' || status === 429) {
    const h = headers.get('retry-after');
    const retryAfterMs = h ? Math.max(1_000, Number(h) * 1000 || 30_000) : 30_000;
    throw new GoogleAdsRateLimitError('Google Ads rate limit', retryAfterMs, parsed);
  }
  if (parsed.classification === 'auth' || status === 401) {
    throw new GoogleAdsTokenExpiredError('Google Ads token hết hạn', parsed);
  }
  if (
    parsed.classification === 'permission' ||
    parsed.classification === 'developer_token' ||
    parsed.classification === 'customer' ||
    status === 403
  ) {
    throw new GoogleAdsPermissionError(userMsg, parsed);
  }
  throw new Error(userMsg);
}

export async function fetchGoogleCampaigns(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT campaign.id, campaign.name, campaign.status, campaign.start_date, campaign.end_date, campaign_budget.amount_micros FROM campaign WHERE campaign.status != 'REMOVED'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleAdGroups(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT ad_group.id, ad_group.name, ad_group.status, campaign.id FROM ad_group WHERE ad_group.status != 'REMOVED'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleAds(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status, ad_group.id, campaign.id FROM ad_group_ad WHERE ad_group_ad.status != 'REMOVED'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleDailyMetrics(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  dateFrom: string,
  dateTo: string,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT campaign.id, campaign.name, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value, metrics.ctr, metrics.average_cpc FROM campaign WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleKeywords(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, ad_group.id, campaign.id FROM keyword_view WHERE ad_group_criterion.type = 'KEYWORD' AND ad_group_criterion.status != 'REMOVED'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleSearchTerms(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  dateFrom: string,
  dateTo: string,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT search_term_view.search_term, campaign.id, ad_group.id, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value, metrics.ctr, metrics.average_cpc FROM search_term_view WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleCampaignMetricsAggregate(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  dateFrom: string,
  dateTo: string,
  timeoutMs: number,
) {
  return adsSearch(
    accessToken,
    customerId,
    `SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'`,
    loginCustomerId,
    timeoutMs,
  );
}

export async function fetchGoogleCustomerDetail(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  timeoutMs: number,
) {
  const rows = await adsSearch(
    accessToken,
    customerId,
    `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1`,
    loginCustomerId,
    timeoutMs,
  );
  return rows[0]?.customer as
    | {
        id?: string;
        descriptiveName?: string;
        currencyCode?: string;
        timeZone?: string;
      }
    | undefined;
}

async function adsMutate(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  collection: string,
  operations: unknown[],
): Promise<string[]> {
  const cid = customerId.replace(/-/g, '');
  const res = await fetch(
    `https://googleads.googleapis.com/${apiVersion()}/customers/${cid}/${collection}:mutate`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken(),
        ...googleAdsLoginHeaders(cid, loginCustomerId),
      },
      body: JSON.stringify({ operations }),
    },
  );
  const text = await res.text();
  let body: {
    results?: Array<{ resourceName?: string }>;
    error?: { message?: string; status?: string; details?: unknown[] };
  };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    throwNormalized(
      res.status,
      {
        error: {
          status: res.status === 404 ? 'NOT_FOUND' : 'UNKNOWN',
          message: `Google Ads non-JSON mutate (${res.status})`,
        },
      },
      res.headers,
    );
  }
  if (!res.ok || body.error) {
    throwNormalized(res.status, body, res.headers);
  }
  return (body.results ?? []).map((r) => r.resourceName).filter((n): n is string => Boolean(n));
}

function biddingField(strategy: GoogleAdsStructuredDraft['biddingStrategy']): Record<string, unknown> {
  if (strategy === 'MAXIMIZE_CONVERSIONS') return { maximizeConversions: {} };
  if (strategy === 'MANUAL_CPC') return { manualCpc: { enhancedCpcEnabled: true } };
  if (strategy === 'TARGET_CPA') return { targetCpa: {} };
  return { maximizeClicks: {} };
}

export function createLiveGoogleAdsMutatePort(input: {
  accessToken: string;
  customerId: string;
  loginCustomerId: string | null;
}): GoogleAdsMutatePort {
  const { accessToken, customerId, loginCustomerId } = input;
  return {
    async createBudget({ name, amountMicros }) {
      const [nameOut] = await adsMutate(accessToken, customerId, loginCustomerId, 'campaignBudgets', [
        {
          create: {
            name,
            amountMicros,
            deliveryMethod: 'STANDARD',
            explicitlyShared: false,
          },
        },
      ]);
      if (!nameOut) throw new Error('Google Ads không trả campaign budget resource');
      return nameOut;
    },
    async createCampaign({ name, budgetResourceName, channelType, biddingStrategy, status }) {
      const [nameOut] = await adsMutate(accessToken, customerId, loginCustomerId, 'campaigns', [
        {
          create: {
            name,
            status,
            advertisingChannelType: channelType,
            campaignBudget: budgetResourceName,
            ...biddingField(biddingStrategy),
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: true,
              targetContentNetwork: false,
            },
          },
        },
      ]);
      if (!nameOut) throw new Error('Google Ads không trả campaign resource');
      return nameOut;
    },
    async createCampaignCriteria({ campaignResourceName, geoIds, languageIds }) {
      const ops = [
        ...geoIds.map((id) => ({
          create: {
            campaign: campaignResourceName,
            location: { geoTargetConstant: `geoTargetConstants/${id}` },
          },
        })),
        ...languageIds.map((id) => ({
          create: {
            campaign: campaignResourceName,
            language: { languageConstant: `languageConstants/${id}` },
          },
        })),
      ];
      return adsMutate(accessToken, customerId, loginCustomerId, 'campaignCriteria', ops);
    },
    async createAdGroup({ campaignResourceName, name }) {
      const [nameOut] = await adsMutate(accessToken, customerId, loginCustomerId, 'adGroups', [
        {
          create: {
            name,
            campaign: campaignResourceName,
            status: 'ENABLED',
            type: 'SEARCH_STANDARD',
          },
        },
      ]);
      if (!nameOut) throw new Error('Google Ads không trả ad group resource');
      return nameOut;
    },
    async createKeywords({ adGroupResourceName, keywords, negative }) {
      const ops = keywords.map((text) => ({
        create: {
          adGroup: adGroupResourceName,
          status: 'ENABLED',
          negative: Boolean(negative),
          keyword: { text, matchType: negative ? 'BROAD' : 'PHRASE' },
        },
      }));
      return adsMutate(accessToken, customerId, loginCustomerId, 'adGroupCriteria', ops);
    },
    async createResponsiveSearchAd({ adGroupResourceName, headlines, descriptions, finalUrl }) {
      const [nameOut] = await adsMutate(accessToken, customerId, loginCustomerId, 'adGroupAds', [
        {
          create: {
            adGroup: adGroupResourceName,
            status: 'ENABLED',
            ad: {
              responsiveSearchAd: {
                headlines: headlines.map((text) => ({ text })),
                descriptions: descriptions.map((text) => ({ text })),
              },
              finalUrls: [finalUrl],
            },
          },
        },
      ]);
      if (!nameOut) throw new Error('Google Ads không trả RSA resource');
      return nameOut;
    },
  };
}

/** Autopilot mutate port — pause/resume/budget/keyword (update ops, not create). */
export interface GoogleAdsAutopilotMutatePort {
  pauseCampaign(campaignResourceName: string): Promise<string>;
  enableCampaign(campaignResourceName: string): Promise<string>;
  updateCampaignBudget(campaignBudgetResource: string, amountMicros: number): Promise<string>;
  pauseKeyword(keywordResource: string): Promise<string>;
  addNegativeKeyword(campaignResourceName: string, text: string): Promise<string>;
}

export function createLiveGoogleAdsAutopilotMutatePort(input: {
  accessToken: string;
  customerId: string;
  loginCustomerId: string | null;
}): GoogleAdsAutopilotMutatePort {
  const { accessToken, customerId, loginCustomerId } = input;
  const cid = customerId.replace(/-/g, '');

  return {
    async pauseCampaign(campaignResourceName) {
      const [out] = await adsMutate(accessToken, customerId, loginCustomerId, 'campaigns', [
        { update: { resourceName: campaignResourceName, status: 'PAUSED' }, updateMask: 'status' },
      ]);
      return out ?? campaignResourceName;
    },
    async enableCampaign(campaignResourceName) {
      const [out] = await adsMutate(accessToken, customerId, loginCustomerId, 'campaigns', [
        { update: { resourceName: campaignResourceName, status: 'ENABLED' }, updateMask: 'status' },
      ]);
      return out ?? campaignResourceName;
    },
    async updateCampaignBudget(campaignBudgetResource, amountMicros) {
      const [out] = await adsMutate(accessToken, customerId, loginCustomerId, 'campaignBudgets', [
        {
          update: { resourceName: campaignBudgetResource, amountMicros: String(amountMicros) },
          updateMask: 'amount_micros',
        },
      ]);
      return out ?? campaignBudgetResource;
    },
    async pauseKeyword(keywordResource) {
      const [out] = await adsMutate(accessToken, customerId, loginCustomerId, 'adGroupCriteria', [
        { update: { resourceName: keywordResource, status: 'PAUSED' }, updateMask: 'status' },
      ]);
      return out ?? keywordResource;
    },
    async addNegativeKeyword(campaignResourceName, text) {
      const [out] = await adsMutate(accessToken, customerId, loginCustomerId, 'campaignCriteria', [
        {
          create: {
            campaign: campaignResourceName,
            negative: true,
            keyword: { text, matchType: 'BROAD' },
          },
        },
      ]);
      return out ?? `customers/${cid}/campaignCriteria/negative`;
    },
  };
}
