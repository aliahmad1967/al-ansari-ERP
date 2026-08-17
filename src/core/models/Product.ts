import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const ProductStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Discontinued: 'discontinued',
} as const

export type ProductStatusValue = (typeof ProductStatus)[keyof typeof ProductStatus]

export interface ProductInput {
  sku: string
  barcode?: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  categoryId: string
  unitId: string
  purchasePrice: number
  sellingPrice: number
  minimumStock?: number
  maximumStock?: number
  weight?: number
  weightUnit?: string
  status?: ProductStatusValue
  isActive?: boolean
}

export class Product extends Realm.Object<Product> {
  declare _id: string
  declare sku: string
  declare barcode: string | null
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare categoryId: string
  declare unitId: string
  declare purchasePrice: number
  declare sellingPrice: number
  declare minimumStock: number
  declare maximumStock: number
  declare weight: number | null
  declare weightUnit: string | null
  declare status: ProductStatusValue
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Product',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      sku: { type: 'string', indexed: true },
      barcode: { type: 'string', optional: true, indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      categoryId: { type: 'string', indexed: true },
      unitId: { type: 'string', indexed: true },
      purchasePrice: { type: 'double', default: 0 },
      sellingPrice: { type: 'double', default: 0 },
      minimumStock: { type: 'double', default: 0 },
      maximumStock: { type: 'double', default: 0 },
      weight: { type: 'double', optional: true },
      weightUnit: { type: 'string', optional: true },
      status: { type: 'string', default: ProductStatus.Active },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type ProductEntity = Product & SoftDeletableEntityFields
