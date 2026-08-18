import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { AccountingPolicyRepository } from '@/core/repositories/AccountingPolicyRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'

export class AccountingPolicyService {
  private readonly repo = new AccountingPolicyRepository()
  private readonly auditRepo = new AuditRepository()

  getValue(key: string): string | null {
    return this.repo.getValue(key)
  }

  getAll(): ReturnType<AccountingPolicyRepository['findAll']> {
    return this.repo.findAll()
  }

  setValue(
    key: string,
    value: string,
    description?: string,
    descriptionAr?: string,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const policy = this.repo.setValue(key, value, description, descriptionAr)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'AccountingPolicy',
      resourceId: policy._id,
      summary: `Policy "${key}" set to "${value}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return policy
  }

  initializeDefaults(_actorUserId?: string, _actorUsername?: string) {
    const defaults = [
      { key: 'currency', value: 'SAR', description: 'Base currency', descriptionAr: 'العملة الأساسية' },
      { key: 'fiscal_year_start_month', value: '1', description: 'Fiscal year start month', descriptionAr: 'شهر بداية السنة المالية' },
      { key: 'auto_numbering', value: 'true', description: 'Auto numbering for journal entries', descriptionAr: 'ترقيم تلقائي للقيود اليومية' },
      { key: 'require_approval', value: 'true', description: 'Require approval before posting', descriptionAr: 'تطلب موافقة قبل الترحيل' },
      { key: 'allow_posting_to_closed_periods', value: 'false', description: 'Allow posting to closed periods', descriptionAr: 'السماح بالترحيل في الفترات المغلقة' },
      { key: 'tax_enabled', value: 'true', description: 'Enable tax calculations', descriptionAr: 'تفعيل حسابات الضريبة' },
      { key: 'tax_rate', value: '15', description: 'Default tax rate (%)', descriptionAr: 'نسبة الضريبة الافتراضية (%)' },
      { key: 'cost_center_required', value: 'false', description: 'Require cost center for journal entries', descriptionAr: 'تطلب مركز تكلفة للقيود اليومية' },
    ]

    for (const d of defaults) {
      const existing = this.repo.findByKey(d.key)
      if (!existing) {
        this.repo.create({
          key: d.key,
          value: d.value,
          description: d.description,
          descriptionAr: d.descriptionAr,
        })
      }
    }
  }
}
