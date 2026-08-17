import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Product, ProductInput } from '@/core/models/Product'
import { ProductRepository } from '@/core/repositories/ProductRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class ProductService {
  private readonly productRepo = new ProductRepository()
  private readonly auditRepo = new AuditRepository()

  findAllProducts(options: FindOptions = {}): Product[] {
    return this.productRepo.findAll(options)
  }

  findProductById(id: string): Product | null {
    return this.productRepo.findById(id)
  }

  findBySku(sku: string): Product | null {
    return this.productRepo.findBySku(sku)
  }

  findByBarcode(barcode: string): Product | null {
    return this.productRepo.findByBarcode(barcode)
  }

  findByCategory(categoryId: string): Product[] {
    return this.productRepo.findByCategory(categoryId)
  }

  searchProducts(query: string): Product[] {
    return this.productRepo.search(query)
  }

  createProduct(input: ProductInput, actorUserId?: string, actorUsername?: string): Product {
    const product = this.productRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'inventory',
      resourceType: 'Product',
      resourceId: product._id,
      summary: `Product "${product.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return product
  }

  updateProduct(id: string, changes: Partial<ProductInput>, actorUserId?: string, actorUsername?: string): Product {
    const product = this.productRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'inventory',
      resourceType: 'Product',
      resourceId: product._id,
      summary: `Product "${product.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return product
  }

  archiveProduct(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const product = this.productRepo.findById(id)
    const result = this.productRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'inventory',
        resourceType: 'Product',
        resourceId: id,
        summary: `Product "${product?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restoreProduct(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.productRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'inventory',
        resourceType: 'Product',
        resourceId: id,
        summary: 'Product restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
