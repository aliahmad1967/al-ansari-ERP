import { Product, type ProductInput } from '../models/Product'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class ProductRepository extends BaseRepository<Product, ProductInput> {
  protected get objectType(): string {
    return 'Product'
  }

  protected get modelClass(): ModelConstructor<Product> {
    return Product
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      sku: required('Product SKU'),
      name: required('Product name'),
      categoryId: required('Category'),
      unitId: required('Unit'),
    })
  }

  findBySku(sku: string, options: FindOptions = {}): Product | null {
    return this.first('sku == $0', [sku], options)
  }

  findByBarcode(barcode: string, options: FindOptions = {}): Product | null {
    return this.first('barcode == $0', [barcode], options)
  }

  findByCategory(categoryId: string, options: FindOptions = {}): Product[] {
    return this.query('categoryId == $0', [categoryId], options)
  }

  findActive(options: FindOptions = {}): Product[] {
    return this.query('isActive == true', [], options)
  }

  search(query: string, options: FindOptions = {}): Product[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const bySku = this.query('sku CONTAINS[c] $0', [query], options)
    const byBarcode = this.query('barcode CONTAINS[c] $0', [query], options)
    const ids = new Set([...byName, ...bySku, ...byBarcode].map(p => p._id))
    return [...byName, ...bySku, ...byBarcode].filter(p => {
      if (ids.has(p._id)) {
        ids.delete(p._id)
        return true
      }
      return false
    })
  }
}
