# Realm Models — Organization, HR, Attendance

All 94 Realm models organized by domain. Verified against source code in `src/core/models/`.

## 1. Organization Domain (5 models)

### Company
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key (UUID) |
| name | string | Company name |
| nameAr | string | Arabic name |
| registrationNumber | string | Commercial registration |
| taxNumber | string | VAT number |
| address, phone, email, website | string | Contact info |
| logo | string | Base64 or path |
| baseCurrency | string | Default: 'SAR' |
| fiscalYearStart | string | Month/day |
| isActive | boolean | |
| createdAt, updatedAt | string | ISO 8601 |

### Branch
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr, code | string | |
| address, phone | string | |
| managerId | string | FK to Employee |
| isActive | boolean | |

### CostCenter
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| parentId | string | FK to CostCenter (hierarchy) |
| code, name, nameAr, description | string | |
| isActive | boolean | |

### Warehouse
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| branchId | string | FK to Branch |
| name, nameAr, code, address | string | |
| managerId | string | FK to Employee |
| type | string | 'main' / 'sub' / 'virtual' |
| isActive | boolean | |

### UnitOfMeasure
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| name, nameAr, symbol | string | e.g. 'Kilogram' / 'kg' |
| conversionFactor | number | To base unit |
| baseUnitId | string | FK to self (nullable) |
| isActive | boolean | |

---

## 2. HR Domain (10 models)

### Employee
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeNumber | string | Auto-generated, unique |
| firstName, lastName, firstNameAr, lastNameAr | string | |
| companyId, branchId, departmentId, positionId | string | FK fields |
| warehouseId, managerId | string | FK fields (nullable) |
| dateOfBirth, gender, nationality, nationalId | string | |
| phone, email, address | string | |
| hireDate, terminationDate | string | |
| employmentStatus | string | 'active' / 'terminated' / 'onLeave' / 'suspended' |
| employmentType | string | 'fullTime' / 'partTime' / 'contract' |
| photo | string | Base64 or path |
| bankName, bankAccountNumber, iban | string | |
| basicSalary, allowances | number | Integer fils |
| isActive, isDeleted | boolean | |
| createdAt, updatedAt | string | |

### Department
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, parentId | string | FK fields (hierarchy) |
| code, name, nameAr | string | |
| managerId, costCenterId | string | FK fields |
| isActive | boolean | |

### Position
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, departmentId | string | FK fields |
| code, name, nameAr, description | string | |
| minSalary, maxSalary | number | Integer fils |
| isActive | boolean | |

### Contract
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId | string | FK to Employee |
| contractNumber, type | string | |
| startDate, endDate, probationEndDate | string | |
| basicSalary, housingAllowance, transportAllowance, otherAllowances | number | Integer fils |
| currency | string | Default 'SAR' |
| renewalCount | number | |
| status | string | 'active' / 'expired' / 'terminated' |
| isActive | boolean | |

### Shift
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr | string | |
| startTime, endTime | string | HH:mm |
| breakMinutes, gracePeriodMinutes | number | |
| isActive | boolean | |

### LeaveType
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr | string | |
| daysPerYear | number | |
| isPaid, isActive | boolean | |

### Leave
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId, leaveTypeId | string | FK fields |
| startDate, endDate | string | |
| days | number | |
| reason | string | |
| status | string | 'pending' / 'approved' / 'rejected' / 'cancelled' |
| approvedBy, approvedAt | string | FK + timestamp |
| isActive | boolean | |

### Document
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId | string | FK to Employee |
| name, type | string | type: 'id' / 'passport' / 'visa' / 'certificate' / 'other' |
| fileData, fileName | string | Base64 encoded |
| expiryDate | string | Nullable |
| isActive | boolean | |

### EmployeeHistory
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId | string | FK to Employee |
| action, actionDate | string | |
| previousValue, newValue | string | JSON strings |
| performedBy | string | FK to Employee |
| notes | string | |

---

## 3. Attendance Domain (5 models)

### AttendanceRecord
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId | string | FK to Employee |
| date | string | YYYY-MM-DD |
| clockIn, clockOut | string | HH:mm:ss |
| workMinutes, overtimeMinutes | number | |
| status | string | 'present' / 'absent' / 'late' / 'early' / 'holiday' |
| notes | string | |

### DailyAttendanceSummary
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId, shiftId | string | FK fields |
| date | string | YYYY-MM-DD |
| expectedMinutes, actualMinutes, overtimeMinutes | number | |
| status | string | 'present' / 'absent' / 'partial' / 'holiday' |
| notes | string | |

### ShiftAssignment
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId, shiftId | string | FK fields |
| startDate, endDate | string | |
| isRecurring | boolean | |
| recurringDays | string | JSON array of day names |

### Schedule
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr, startDate, endDate | string | |
| isActive | boolean | |

### ScheduleEntry
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| scheduleId, employeeId, shiftId | string | FK fields |
| date | string | |
| notes | string | |
