'use client';

import type { ReactNode } from 'react';
import type { InspectorContextKind } from './landing-page-inspector-context';
import { InspectorAccordion } from './landing-page-inspector-ui';

export type LandingPageInspectorElementActionsProps = {
  contextKind: InspectorContextKind;
  sectionLocked?: boolean;
  /** Section reorder in flow layout */
  allowSectionReorder?: boolean;
  canReplaceImage?: boolean;
  isTextHidden?: boolean;
  isTextLocked?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAi?: () => void;
  onReplaceImage?: () => void;
  onCopy?: () => void;
  onCopyStyle?: () => void;
  onSaveAsset?: () => void;
  onSyncFromMobile?: () => void;
  onToggleHidden?: () => void;
  onToggleLock?: () => void;
  onAiPrompt?: () => void;
  /** Hide Ẩn/Khóa — show those on tab Nâng cao instead. */
  hideVisibilityControls?: boolean;
};

function ActionBtn({
  children,
  title,
  disabled,
  onClick,
  dataLp,
}: {
  children: ReactNode;
  title: string;
  disabled?: boolean;
  onClick?: () => void;
  dataLp?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled || !onClick}
      data-lp={dataLp}
      className="rounded border border-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
      onClick={() => onClick?.()}
    >
      {children}
    </button>
  );
}

/** Canvas + Inspector: element actions moved off the floating text toolbar. */
export function LandingPageInspectorElementActions(props: LandingPageInspectorElementActionsProps) {
  const {
    contextKind,
    sectionLocked,
    allowSectionReorder,
    canReplaceImage,
    isTextHidden,
    isTextLocked,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onDelete,
    onAi,
    onReplaceImage,
    onCopy,
    onCopyStyle,
    onSaveAsset,
    onSyncFromMobile,
    onToggleHidden,
    onToggleLock,
    onAiPrompt,
    hideVisibilityControls,
  } = props;

  const showSectionRow =
    contextKind === 'section' ||
    contextKind === 'form' ||
    contextKind === 'video' ||
    contextKind === 'countdown';
  const showTextExtras = contextKind === 'text';
  const showElementRow =
    contextKind === 'text' ||
    contextKind === 'button' ||
    contextKind === 'image' ||
    contextKind === 'icon' ||
    showSectionRow;

  if (!showElementRow) return null;

  return (
    <InspectorAccordion title="Thao tác" data-lp="element-actions" defaultOpen>
      <div className="flex flex-wrap gap-1.5" data-lp-inspector-element-actions>
        {showSectionRow && allowSectionReorder ? (
          <>
            <ActionBtn title="Lên một lớp" onClick={onMoveUp} dataLp="move-up">
              ↑ Lên
            </ActionBtn>
            <ActionBtn title="Xuống một lớp" onClick={onMoveDown} dataLp="move-down">
              ↓ Xuống
            </ActionBtn>
          </>
        ) : null}
        {(showTextExtras ||
          showSectionRow ||
          contextKind === 'button' ||
          contextKind === 'image' ||
          contextKind === 'icon') &&
        onMoveUp &&
        !showSectionRow ? (
          <>
            <ActionBtn title="Lên" onClick={onMoveUp} dataLp="move-up">
              ↑
            </ActionBtn>
            <ActionBtn title="Xuống" onClick={onMoveDown} dataLp="move-down">
              ↓
            </ActionBtn>
          </>
        ) : null}
        <ActionBtn title="Nhân bản" disabled={sectionLocked} onClick={onDuplicate} dataLp="duplicate">
          Nhân bản
        </ActionBtn>
        {onAi ? (
          <ActionBtn title="AI section" disabled={sectionLocked} onClick={onAi} dataLp="ai">
            AI
          </ActionBtn>
        ) : null}
        {canReplaceImage && onReplaceImage ? (
          <ActionBtn title="Thay ảnh" disabled={sectionLocked} onClick={onReplaceImage} dataLp="replace-image">
            Thay ảnh
          </ActionBtn>
        ) : null}
        <ActionBtn title="Xóa" disabled={sectionLocked} onClick={onDelete} dataLp="delete">
          Xóa
        </ActionBtn>
      </div>

      {showTextExtras ? (
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/10 pt-2" data-lp-inspector-text-actions>
          <ActionBtn title="Sao chép block" onClick={onCopy} dataLp="copy">
            Copy
          </ActionBtn>
          <ActionBtn title="Sao chép style" onClick={onCopyStyle} dataLp="copy-style">
            Copy style
          </ActionBtn>
          <ActionBtn title="Lưu text asset" onClick={onSaveAsset} dataLp="save-asset">
            Lưu asset
          </ActionBtn>
          <ActionBtn title="Đồng bộ từ mobile" onClick={onSyncFromMobile} dataLp="sync-mobile">
            Sync mobile
          </ActionBtn>
          <ActionBtn title="AI prompt nhanh" onClick={onAiPrompt} dataLp="ai-prompt">
            AI prompt
          </ActionBtn>
          {!hideVisibilityControls ? (
            <>
              <ActionBtn
                title={isTextHidden ? 'Hiện phần tử' : 'Ẩn phần tử'}
                disabled={sectionLocked}
                onClick={onToggleHidden}
                dataLp="toggle-hidden"
              >
                {isTextHidden ? 'Hiện' : 'Ẩn'}
              </ActionBtn>
              <ActionBtn
                title={isTextLocked ? 'Mở khóa' : 'Khóa chỉnh sửa'}
                onClick={onToggleLock}
                dataLp="toggle-lock"
              >
                {isTextLocked ? 'Mở khóa' : 'Khóa'}
              </ActionBtn>
            </>
          ) : null}
        </div>
      ) : null}
    </InspectorAccordion>
  );
}
