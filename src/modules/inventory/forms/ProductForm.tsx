import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: {
    _id: string
    sku: string
    barcode: string | null
    name: string
    nameAr: string | null
    categoryId: string
    unitId: string
    purchasePrice: number
    sellingPrice: number
    minimumStock: number | null
    maximumStock: number | null
    weight: number | null
    weightUnit: string | null
    status: string
    description: string | null
    descriptionAr: string | null
  } | null
  onSubmit: (input: Record<string, unknown>) => void
  categories: Array<{ _id: string; name: string; nameAr: string | null }>
  units: Array<{ _id: string; name: string; nameAr: string | null }>
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
  categories,
  units,
}: ProductFormProps) {
  const { t } = useTranslation('inventory')
  const isEdit = !!product

  const [sku, setSku] = useState(() => product?.sku ?? '')
  const [barcode, setBarcode] = useState(() => product?.barcode ?? '')
  const [name, setName] = useState(() => product?.name ?? '')
  const [nameAr, setNameAr] = useState(() => product?.nameAr ?? '')
  const [categoryId, setCategoryId] = useState(() => product?.categoryId ?? '')
  const [unitId, setUnitId] = useState(() => product?.unitId ?? '')
  const [purchasePrice, setPurchasePrice] = useState(() => product?.purchasePrice ?? '')
  const [sellingPrice, setSellingPrice] = useState(() => product?.sellingPrice ?? '')
  const [minimumStock, setMinimumStock] = useState(() => product?.minimumStock ?? '')
  const [maximumStock, setMaximumStock] = useState(() => product?.maximumStock ?? '')
  const [weight, setWeight] = useState(() => product?.weight ?? '')
  const [weightUnit, setWeightUnit] = useState(() => product?.weightUnit ?? '')
  const [status, setStatus] = useState(() => product?.status ?? 'active')
  const [description, setDescription] = useState(() => product?.description ?? '')
  const [descriptionAr, setDescriptionAr] = useState(() => product?.descriptionAr ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!sku.trim()) newErrors.sku = 'Required'
    if (!name.trim()) newErrors.name = 'Required'
    if (!categoryId) newErrors.categoryId = 'Required'
    if (!unitId) newErrors.unitId = 'Required'
    if (!purchasePrice && purchasePrice !== 0) newErrors.purchasePrice = 'Required'
    if (!sellingPrice && sellingPrice !== 0) newErrors.sellingPrice = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      sku: sku.trim(),
      barcode: barcode.trim() || undefined,
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      categoryId,
      unitId,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      minimumStock: minimumStock !== '' ? Number(minimumStock) : undefined,
      maximumStock: maximumStock !== '' ? Number(maximumStock) : undefined,
      weight: weight !== '' ? Number(weight) : undefined,
      weightUnit: weightUnit || undefined,
      status,
      description: description.trim() || undefined,
      descriptionAr: descriptionAr.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={product?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('product.edit') : t('product.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('product.edit') : t('product.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('product.sku')} required error={errors.sku}>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('product.barcode')}>
          <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </FormField>
        <FormField label={t('product.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('product.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('product.category')} required error={errors.categoryId}>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">{t('product.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('product.unit')} required error={errors.unitId}>
          <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            <option value="">{t('product.selectUnit')}</option>
            {units.map((unit) => (
              <option key={unit._id} value={unit._id}>
                {unit.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('product.purchasePrice')} required error={errors.purchasePrice}>
          <Input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </FormField>
        <FormField label={t('product.sellingPrice')} required error={errors.sellingPrice}>
          <Input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
        </FormField>
        <FormField label={t('product.minimumStock')}>
          <Input
            type="number"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value)}
          />
        </FormField>
        <FormField label={t('product.maximumStock')}>
          <Input
            type="number"
            value={maximumStock}
            onChange={(e) => setMaximumStock(e.target.value)}
          />
        </FormField>
        <FormField label={t('product.weight')}>
          <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </FormField>
        <FormField label={t('product.weightUnit')}>
          <Select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}>
            <option value="">{t('product.selectWeightUnit')}</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
          </Select>
        </FormField>
        <FormField label={t('product.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">{t('product.active')}</option>
            <option value="inactive">{t('product.inactive')}</option>
            <option value="discontinued">{t('product.discontinued')}</option>
          </Select>
        </FormField>
        <FormField label={t('product.description')} className="sm:col-span-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>
        <FormField label={t('product.descriptionAr')} className="sm:col-span-2">
          <Input
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            dir="rtl"
          />
        </FormField>
      </div>
    </Dialog>
  )
}

export default ProductForm
