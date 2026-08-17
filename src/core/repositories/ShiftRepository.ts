import { Shift, type ShiftInput } from '../models/Shift'
import { BaseRepository, type ModelConstructor } from './BaseRepository'

export class ShiftRepository extends BaseRepository<Shift, ShiftInput> {
  protected get objectType(): string {
    return 'Shift'
  }

  protected get modelClass(): ModelConstructor<Shift> {
    return Shift
  }

  findActive(): Shift[] {
    return this.query('isActive == true', [])
  }

  findByName(name: string): Shift | null {
    return this.first('name == $0', [name])
  }
}
