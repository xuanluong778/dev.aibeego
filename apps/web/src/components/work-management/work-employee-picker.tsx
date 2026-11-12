'use client';

import React, { useMemo, useState } from 'react';
import { Check, Plus, Search, UserPlus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHrmDepartments, useHrmEmployees, useHrmEmployeeMutations } from '@/hooks/use-hrm';
import { useCurrentUser, hasPermission } from '@/hooks/use-auth';
import type { HrmEmployee } from '@/types/hrm';
import { cn } from '@/lib/utils';

export type EmployeeOption = {
  id: string;
  name: string;
  code?: string | null;
  email?: string | null;
  departmentName?: string | null;
  position?: string | null;
  isActive?: boolean;
};

interface WorkEmployeePickerProps {
  label: string;
  value: string | string[]; // string for single, string[] for multiple
  onChange: (val: any) => void;
  multiple?: boolean;
  placeholder?: string;
  // Previously assigned employees to always preserve and display (even if inactive/not in search results)
  initialEmployees?: EmployeeOption[];
}

export function WorkEmployeePicker({
  label,
  value,
  onChange,
  multiple = false,
  placeholder = 'Tìm nhân viên...',
  initialEmployees = [],
}: WorkEmployeePickerProps) {
  const user = useCurrentUser();
  const canCreateEmployee = hasPermission(user, 'hrm.employee.write');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Quick inline add employee state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Queries
  const employeesQ = useHrmEmployees({
    q: search.trim() || undefined,
    page,
    pageSize: 20,
  });
  const departmentsQ = useHrmDepartments();
  const employeeMutations = useHrmEmployeeMutations();

  // Map known employees from initialEmployees + fetched employees
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeOption>();
    for (const emp of initialEmployees) {
      map.set(emp.id, emp);
    }
    for (const emp of employeesQ.data?.items ?? []) {
      map.set(emp.id, {
        id: emp.id,
        name: emp.name,
        code: emp.code,
        email: emp.email,
        departmentName: emp.department?.name,
        position: emp.position,
        isActive: emp.isActive ?? true,
      });
    }
    return map;
  }, [initialEmployees, employeesQ.data?.items]);

  const selectedIds = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === 'string' && value ? [value] : [];
  }, [multiple, value]);

  const selectedEmployees = useMemo(() => {
    return selectedIds.map(
      (id) => employeeMap.get(id) || { id, name: `Nhân viên #${id.slice(0, 6)}` },
    );
  }, [selectedIds, employeeMap]);

  function handleSelect(id: string) {
    if (multiple) {
      const arr = Array.isArray(value) ? [...value] : [];
      if (arr.includes(id)) {
        onChange(arr.filter((item) => item !== id));
      } else {
        onChange([...arr, id]);
      }
    } else {
      if (value === id) {
        onChange('');
      } else {
        onChange(id);
      }
    }
  }

  function handleRemove(id: string) {
    if (multiple) {
      const arr = Array.isArray(value) ? [...value] : [];
      onChange(arr.filter((item) => item !== id));
    } else {
      onChange('');
    }
  }

  async function handleCreateEmployee() {
    if (!newName.trim()) {
      setCreateError('Họ và tên là bắt buộc');
      return;
    }
    setCreateError(null);
    try {
      const created = await employeeMutations.create.mutateAsync({
        name: newName.trim(),
        code: newCode.trim() || undefined,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
        departmentId: newDepartmentId || undefined,
        position: newPosition.trim() || undefined,
      });

      // Add to current selection immediately
      if (created?.id) {
        if (multiple) {
          const arr = Array.isArray(value) ? [...value] : [];
          if (!arr.includes(created.id)) onChange([...arr, created.id]);
        } else {
          onChange(created.id);
        }
      }

      // Reset and close dialog
      setNewName('');
      setNewCode('');
      setNewEmail('');
      setNewPhone('');
      setNewDepartmentId('');
      setNewPosition('');
      setOpenAddDialog(false);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tạo nhân viên. Vui lòng kiểm tra lại mã hoặc email.';
      setCreateError(msg);
    }
  }

  const items = employeesQ.data?.items ?? [];
  const total = employeesQ.data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {canCreateEmployee && (
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setOpenAddDialog(true);
            }}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <UserPlus className="h-3 w-3" /> Thêm nhân viên
          </button>
        )}
      </div>

      {/* Selected chips (for multiple or single) */}
      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-1 rounded-md border bg-muted/20 min-h-[34px]">
          {selectedEmployees.map((emp) => (
            <Badge
              key={emp.id}
              variant="secondary"
              className="flex items-center gap-1 text-xs py-0.5 px-2 font-normal"
            >
              <span>{emp.name}</span>
              {emp.code && <span className="text-[10px] opacity-70">({emp.code})</span>}
              {emp.departmentName && (
                <span className="text-[10px] text-muted-foreground">· {emp.departmentName}</span>
              )}
              {emp.isActive === false && (
                <span className="text-[10px] text-destructive italic">(Đã nghỉ)</span>
              )}
              <button
                type="button"
                className="ml-0.5 hover:text-destructive"
                onClick={() => handleRemove(emp.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search box & Dropdown list */}
      <div className="rounded-md border bg-background">
        <div className="relative border-b">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={placeholder}
            className="pl-8 h-8 text-xs border-0 focus-visible:ring-0 shadow-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-40 overflow-y-auto divide-y divide-border/50 text-xs">
          {employeesQ.isLoading && (
            <p className="p-2 text-center text-muted-foreground">Đang tìm kiếm...</p>
          )}

          {!employeesQ.isLoading && items.length === 0 && (
            <div className="p-3 text-center text-muted-foreground">
              <p>Không tìm thấy nhân viên phù hợp</p>
              {canCreateEmployee && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 text-xs"
                  onClick={() => {
                    setNewName(search);
                    setCreateError(null);
                    setOpenAddDialog(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Thêm "{search}" vào hệ thống
                </Button>
              )}
            </div>
          )}

          {items.map((emp) => {
            const isSelected = selectedIds.includes(emp.id);
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => handleSelect(emp.id)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-muted/50 transition-colors',
                  isSelected && 'bg-primary/10 font-medium',
                )}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{emp.name}</span>
                    {emp.code && (
                      <span className="text-[10px] text-muted-foreground">({emp.code})</span>
                    )}
                    {emp.isActive === false && (
                      <span className="text-[10px] text-destructive">(Đã nghỉ)</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {[emp.department?.name, emp.position, emp.email].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Pagination controls if > 1 page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1 border-t text-[11px] text-muted-foreground bg-muted/20">
            <span>
              Trang {page}/{totalPages} ({total} nhân viên)
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-5 px-1.5 text-[10px]"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-5 px-1.5 text-[10px]"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {createError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                {createError}
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Mã nhân viên</Label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="NV001"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Chức vụ</Label>
                <Input
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Chuyên viên marketing"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@congty.com"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Số điện thoại</Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0912345678"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phòng ban</Label>
              <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {(departmentsQ.data ?? []).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-xs">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpenAddDialog(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={employeeMutations.create.isPending || !newName.trim()}
              onClick={handleCreateEmployee}
            >
              {employeeMutations.create.isPending ? 'Đang tạo...' : 'Tạo và chọn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

