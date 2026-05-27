import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TablesRepository } from './tables.repository';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { ChangeTableStatusDto } from './dto/change-table-status.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class TablesService {
  constructor(
    private readonly tablesRepository: TablesRepository,
    private readonly realtimeService: RealtimeService,
  ) {}

  private buildTablePayload(table: any) {
    return {
      tableId: table.id,
      tableNumber: table.tableNumber,
      status: table.status,
      timestamp: new Date().toISOString(),
    };
  }

  async create(createTableDto: CreateTableDto) {
    const existingTable = await this.tablesRepository.findByTableNumber(createTableDto.tableNumber);
    if (existingTable) {
      throw new ConflictException(`Table number ${createTableDto.tableNumber} already exists`);
    }
    return this.tablesRepository.create(createTableDto);
  }

  async findAll() {
    return this.tablesRepository.findAll();
  }

  async findOne(id: string) {
    const table = await this.tablesRepository.findById(id);
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    const table = await this.findOne(id);

    if (updateTableDto.tableNumber && updateTableDto.tableNumber !== table.tableNumber) {
      const existingTable = await this.tablesRepository.findByTableNumber(updateTableDto.tableNumber);
      if (existingTable) {
        throw new ConflictException(`Table number ${updateTableDto.tableNumber} already exists`);
      }
    }

    return this.tablesRepository.update(id, updateTableDto);
  }

  async changeStatus(id: string, changeStatusDto: ChangeTableStatusDto) {
    await this.findOne(id); // Ensure table exists
    const updated = await this.tablesRepository.update(id, { status: changeStatusDto.status });

    // Emit WebSocket events
    const payload = this.buildTablePayload(updated);
    this.realtimeService.emitTableStatusUpdated(payload);

    if (changeStatusDto.status === 'OCCUPIED') {
      this.realtimeService.emitTableOccupied(payload);
    } else if (changeStatusDto.status === 'AVAILABLE') {
      this.realtimeService.emitTableAvailable(payload);
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure table exists
    return this.tablesRepository.delete(id);
  }
}
