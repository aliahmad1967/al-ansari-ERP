/**
 * DevEmployeeService — browser-compatible HR services using localStorage.
 */

const DEV_STORAGE_KEY = 'erp_dev_hr_data'

interface DevEmployee {
  _id: string
  employeeNumber: string
  firstName: string
  lastName: string
  firstNameAr: string | null
  lastNameAr: string | null
  email: string
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  nationality: string | null
  nationalId: string | null
  maritalStatus: string | null
  address: string | null
  city: string | null
  country: string | null
  photoUrl: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  positionId: string | null
  managerId: string | null
  employmentDate: string
  terminationDate: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevContract {
  _id: string
  employeeId: string
  contractNumber: string
  type: string
  startDate: string
  endDate: string | null
  salary: number | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevDocument {
  _id: string
  employeeId: string
  name: string
  type: string
  fileUrl: string | null
  expiryDate: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevEmergencyContact {
  _id: string
  employeeId: string
  name: string
  phone: string
  relationship: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevEducation {
  _id: string
  employeeId: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string | null
  endDate: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevExperience {
  _id: string
  employeeId: string
  company: string
  title: string
  startDate: string | null
  endDate: string | null
  description: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevSkill {
  _id: string
  employeeId: string
  name: string
  level: string
  category: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevHrData {
  employees: DevEmployee[]
  contracts: DevContract[]
  documents: DevDocument[]
  emergencyContacts: DevEmergencyContact[]
  education: DevEducation[]
  experience: DevExperience[]
  skills: DevSkill[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function now(): string {
  return new Date().toISOString()
}

function loadData(): DevHrData {
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DevHrData
  } catch { /* ignore */ }
  return seedData()
}

function saveData(data: DevHrData): void {
  try {
    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

function seedData(): DevHrData {
  const empIds = Array.from({ length: 15 }, () => generateId()) as [string, string, string, string, string, string, string, string, string, string, string, string, string, string, string]
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T

  const employees: DevEmployee[] = [
    { _id: empIds[0], employeeNumber: 'EMP-001', firstName: 'Ahmad', lastName: 'Hassan', firstNameAr: 'أحمد', lastNameAr: 'حسن', email: 'ahmad@alansari.com', phone: '+966501234567', dateOfBirth: '1990-05-15', gender: 'male', nationality: 'Saudi', nationalId: '1012345678', maritalStatus: 'married', address: '123 King Fahd Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-eng', positionId: 'pos-senior-eng', managerId: empIds[4], employmentDate: '2020-01-15', terminationDate: null, status: 'active', notes: 'Lead developer', isDeleted: false, deletedAt: null, createdAt: '2020-01-15T08:00:00Z', updatedAt: now() },
    { _id: empIds[1], employeeNumber: 'EMP-002', firstName: 'Sara', lastName: 'Ali', firstNameAr: 'سارة', lastNameAr: 'علي', email: 'sara@alansari.com', phone: '+966509876543', dateOfBirth: '1992-08-20', gender: 'female', nationality: 'Saudi', nationalId: '1023456789', maritalStatus: 'single', address: '456 Olaya Street', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-hr', positionId: 'pos-hr-mgr', managerId: null, employmentDate: '2021-03-01', terminationDate: null, status: 'active', notes: 'HR Manager', isDeleted: false, deletedAt: null, createdAt: '2021-03-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[2], employeeNumber: 'EMP-003', firstName: 'Omar', lastName: 'Khan', firstNameAr: 'عمر', lastNameAr: 'خان', email: 'omar@alansari.com', phone: '+966505551234', dateOfBirth: '1988-02-10', gender: 'male', nationality: 'Pakistani', nationalId: '2034567890', maritalStatus: 'married', address: '789 King Abdulaziz Road', city: 'Jeddah', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-sales', positionId: 'pos-sales-exec', managerId: empIds[5], employmentDate: '2019-06-15', terminationDate: null, status: 'active', notes: 'Top performer', isDeleted: false, deletedAt: null, createdAt: '2019-06-15T08:00:00Z', updatedAt: now() },
    { _id: empIds[3], employeeNumber: 'EMP-004', firstName: 'Fatima', lastName: 'Zaid', firstNameAr: 'فاطمة', lastNameAr: 'زيد', email: 'fatima@alansari.com', phone: '+966507778899', dateOfBirth: '1995-11-30', gender: 'female', nationality: 'Saudi', nationalId: '1045678901', maritalStatus: 'single', address: '321 Prince Sultan Street', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-finance', positionId: 'pos-accountant', managerId: empIds[6], employmentDate: '2022-07-01', terminationDate: null, status: 'active', notes: null, isDeleted: false, deletedAt: null, createdAt: '2022-07-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[4], employeeNumber: 'EMP-005', firstName: 'Mohammed', lastName: 'Saleh', firstNameAr: 'محمد', lastNameAr: 'صالح', email: 'mohammed@alansari.com', phone: '+966504443322', dateOfBirth: '1985-03-22', gender: 'male', nationality: 'Saudi', nationalId: '1056789012', maritalStatus: 'married', address: '567 King Saud Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-eng', positionId: 'pos-eng-dir', managerId: null, employmentDate: '2018-01-10', terminationDate: null, status: 'active', notes: 'Engineering Director', isDeleted: false, deletedAt: null, createdAt: '2018-01-10T08:00:00Z', updatedAt: now() },
    { _id: empIds[5], employeeNumber: 'EMP-006', firstName: 'Noura', lastName: 'Ibrahim', firstNameAr: 'نورة', lastNameAr: 'إبراهيم', email: 'noura@alansari.com', phone: '+966506665544', dateOfBirth: '1991-07-14', gender: 'female', nationality: 'Saudi', nationalId: '1067890123', maritalStatus: 'married', address: '890 King Abdullah Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-sales', positionId: 'pos-sales-mgr', managerId: null, employmentDate: '2019-09-01', terminationDate: null, status: 'active', notes: 'Sales Manager', isDeleted: false, deletedAt: null, createdAt: '2019-09-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[6], employeeNumber: 'EMP-007', firstName: 'Khalid', lastName: 'Mahmoud', firstNameAr: 'خالد', lastNameAr: 'محمود', email: 'khalid@alansari.com', phone: '+966508889900', dateOfBirth: '1987-12-05', gender: 'male', nationality: 'Egyptian', nationalId: '3078901234', maritalStatus: 'married', address: '234 Prince Mohammed Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-finance', positionId: 'pos-finance-mgr', managerId: null, employmentDate: '2019-02-15', terminationDate: null, status: 'active', notes: 'Finance Manager', isDeleted: false, deletedAt: null, createdAt: '2019-02-15T08:00:00Z', updatedAt: now() },
    { _id: empIds[7], employeeNumber: 'EMP-008', firstName: 'Lina', lastName: 'Farouk', firstNameAr: 'لينا', lastNameAr: 'فاروق', email: 'lina@alansari.com', phone: '+966503332211', dateOfBirth: '1993-04-18', gender: 'female', nationality: 'Egyptian', nationalId: '4089012345', maritalStatus: 'single', address: '678 King Faisal Road', city: 'Jeddah', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-ops', positionId: 'pos-ops-coord', managerId: empIds[10], employmentDate: '2021-11-01', terminationDate: null, status: 'active', notes: null, isDeleted: false, deletedAt: null, createdAt: '2021-11-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[8], employeeNumber: 'EMP-009', firstName: 'Yusuf', lastName: 'Qureshi', firstNameAr: 'يوسف', lastNameAr: 'قريشي', email: 'yusuf@alansari.com', phone: '+966502223344', dateOfBirth: '1994-09-25', gender: 'male', nationality: 'Pakistani', nationalId: '5090123456', maritalStatus: 'single', address: '912 King Khalid Road', city: 'Dammam', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-eng', positionId: 'pos-junior-eng', managerId: empIds[4], employmentDate: '2023-01-15', terminationDate: null, status: 'active', notes: null, isDeleted: false, deletedAt: null, createdAt: '2023-01-15T08:00:00Z', updatedAt: now() },
    { _id: empIds[9], employeeNumber: 'EMP-010', firstName: 'Mona', lastName: 'Rashid', firstNameAr: 'منى', lastNameAr: 'راشد', email: 'mona@alansari.com', phone: '+966501112233', dateOfBirth: '1996-01-08', gender: 'female', nationality: 'Saudi', nationalId: '1101234567', maritalStatus: 'single', address: '345 King Fahd Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-mktg', positionId: 'pos-mktg-spec', managerId: empIds[12], employmentDate: '2023-06-01', terminationDate: null, status: 'active', notes: null, isDeleted: false, deletedAt: null, createdAt: '2023-06-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[10], employeeNumber: 'EMP-011', firstName: 'Ali', lastName: 'Raza', firstNameAr: 'علي', lastNameAr: 'رضا', email: 'ali@alansari.com', phone: '+966509998877', dateOfBirth: '1986-06-12', gender: 'male', nationality: 'Pakistani', nationalId: '6112345678', maritalStatus: 'married', address: '789 King Abdulaziz Road', city: 'Jeddah', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-ops', positionId: 'pos-ops-dir', managerId: null, employmentDate: '2018-04-01', terminationDate: null, status: 'active', notes: 'Operations Director', isDeleted: false, deletedAt: null, createdAt: '2018-04-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[11], employeeNumber: 'EMP-012', firstName: 'Huda', lastName: 'Bakri', firstNameAr: 'هدى', lastNameAr: 'بكري', email: 'huda@alansari.com', phone: '+966507776655', dateOfBirth: '1997-02-28', gender: 'female', nationality: 'Sudanese', nationalId: '7123456789', maritalStatus: 'single', address: '456 Olaya Street', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-admin', positionId: 'pos-admin-asst', managerId: null, employmentDate: '2024-01-01', terminationDate: null, status: 'active', notes: null, isDeleted: false, deletedAt: null, createdAt: '2024-01-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[12], employeeNumber: 'EMP-013', firstName: 'Rami', lastName: 'Jaber', firstNameAr: 'رامي', lastNameAr: 'جابر', email: 'rami@alansari.com', phone: '+966505554433', dateOfBirth: '1989-10-17', gender: 'male', nationality: 'Jordanian', nationalId: '8134567890', maritalStatus: 'married', address: '234 King Saud Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-mktg', positionId: 'pos-mktg-mgr', managerId: null, employmentDate: '2020-03-15', terminationDate: null, status: 'active', notes: 'Marketing Manager', isDeleted: false, deletedAt: null, createdAt: '2020-03-15T08:00:00Z', updatedAt: now() },
    { _id: empIds[13], employeeNumber: 'EMP-014', firstName: 'Aisha', lastName: 'Noor', firstNameAr: 'عائشة', lastNameAr: 'نور', email: 'aisha@alansari.com', phone: '+966503334455', dateOfBirth: '1998-08-03', gender: 'female', nationality: 'Indian', nationalId: '9145678901', maritalStatus: 'single', address: '567 King Fahd Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-eng', positionId: 'pos-junior-eng', managerId: empIds[4], employmentDate: '2024-02-01', terminationDate: null, status: 'active', notes: null, isDeleted: false, deletedAt: null, createdAt: '2024-02-01T08:00:00Z', updatedAt: now() },
    { _id: empIds[14], employeeNumber: 'EMP-015', firstName: 'Bilal', lastName: 'Farid', firstNameAr: 'بلال', lastNameAr: 'فريد', email: 'bilal@alansari.com', phone: '+966502221100', dateOfBirth: '1991-12-20', gender: 'male', nationality: 'Lebanese', nationalId: '1056789123', maritalStatus: 'single', address: '890 King Abdullah Road', city: 'Riyadh', country: 'Saudi Arabia', photoUrl: null, organizationId: null, branchId: null, departmentId: 'dept-sales', positionId: 'pos-sales-exec', managerId: empIds[5], employmentDate: '2022-09-01', terminationDate: '2024-06-30', status: 'terminated', notes: 'Resigned', isDeleted: false, deletedAt: null, createdAt: '2022-09-01T08:00:00Z', updatedAt: now() },
  ]

  const contracts: DevContract[] = employees.filter(e => e.status !== 'terminated').map((emp, i) => ({
    _id: generateId(),
    employeeId: emp._id,
    contractNumber: `CTR-2024-${String(i + 1).padStart(3, '0')}`,
    type: i % 5 === 0 ? 'part-time' : 'full-time',
    startDate: `${2020 + Math.floor(i / 3)}-01-01`,
    endDate: i < 12 ? `${2025 + Math.floor(i / 4)}-12-31` : null,
    salary: [15000, 12000, 18000, 10000, 25000, 20000, 22000, 9000, 8000, 11000, 28000, 7500, 21000, 8500][i] ?? 10000,
    status: 'active',
    notes: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: emp.createdAt,
    updatedAt: now(),
  }))

  const documents: DevDocument[] = employees.slice(0, 10).flatMap(emp => [
    { _id: generateId(), employeeId: emp._id, name: 'National ID', type: 'identification', fileUrl: null, expiryDate: '2028-12-31', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), employeeId: emp._id, name: 'Passport', type: 'travel', fileUrl: null, expiryDate: '2027-06-15', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
  ])

  const emergencyContacts: DevEmergencyContact[] = employees.map(emp => ({
    _id: generateId(),
    employeeId: emp._id,
    name: emp.gender === 'male' ? `Wife of ${emp.firstName}` : `Husband of ${emp.firstName}`,
    phone: `+96650${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
    relationship: emp.maritalStatus === 'married' ? 'Spouse' : 'Parent',
    isDeleted: false,
    deletedAt: null,
    createdAt: now(),
    updatedAt: now(),
  }))

  const education: DevEducation[] = employees.map(emp => ({
    _id: generateId(),
    employeeId: emp._id,
    institution: pick(['King Saud University', 'King Abdulaziz University', 'KFUPM', 'Imam University', 'King Faisal University']),
    degree: pick(['Bachelor', 'Master', 'Diploma']),
    fieldOfStudy: pick(['Computer Science', 'Business Administration', 'Engineering', 'Accounting', 'Marketing', 'HR Management']),
    startDate: `${2010 + Math.floor(Math.random() * 8)}-09-01`,
    endDate: `${2014 + Math.floor(Math.random() * 6)}-06-30`,
    notes: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: now(),
    updatedAt: now(),
  }))

  const experience: DevExperience[] = employees.filter((_, i) => i % 3 === 0).map(emp => ({
    _id: generateId(),
    employeeId: emp._id,
    company: pick(['Saudi Aramco', 'SABIC', 'STC', 'Al Rajhi Bank', 'Saudia']),
    title: emp.positionId?.replace('pos-', '').replace('-', ' ') ?? 'Engineer',
    startDate: '2015-01-01',
    endDate: '2019-12-31',
    description: 'Professional experience',
    isDeleted: false,
    deletedAt: null,
    createdAt: now(),
    updatedAt: now(),
  }))

  const skills: DevSkill[] = employees.flatMap(emp => [
    { _id: generateId(), employeeId: emp._id, name: 'Microsoft Office', level: 'advanced', category: 'Software', isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), employeeId: emp._id, name: emp.departmentId?.includes('eng') ? 'TypeScript' : 'Communication', level: 'intermediate', category: emp.departmentId?.includes('eng') ? 'Programming' : 'Soft Skills', isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
  ])

  const data: DevHrData = { employees, contracts, documents, emergencyContacts, education, experience, skills }
  saveData(data)
  return data
}

class DevEmployeeServiceClass {
  // Employees
  getEmployees(): DevEmployee[] {
    return loadData().employees.filter(e => !e.isDeleted)
  }

  getEmployee(id: string): DevEmployee | undefined {
    return loadData().employees.find(e => e._id === id && !e.isDeleted)
  }

  createEmployee(input: Record<string, unknown>): DevEmployee {
    const data = loadData()
    const emp: DevEmployee = {
      _id: generateId(),
      employeeNumber: (input.employeeNumber as string) || `EMP-${String(data.employees.length + 1).padStart(3, '0')}`,
      firstName: (input.firstName as string) || '',
      lastName: (input.lastName as string) || '',
      firstNameAr: (input.firstNameAr as string) || null,
      lastNameAr: (input.lastNameAr as string) || null,
      email: (input.email as string) || '',
      phone: (input.phone as string) || null,
      dateOfBirth: input.dateOfBirth ? String(input.dateOfBirth) : null,
      gender: (input.gender as string) || null,
      nationality: (input.nationality as string) || null,
      nationalId: (input.nationalId as string) || null,
      maritalStatus: (input.maritalStatus as string) || null,
      address: (input.address as string) || null,
      city: (input.city as string) || null,
      country: (input.country as string) || null,
      photoUrl: (input.photoUrl as string) || null,
      organizationId: (input.organizationId as string) || null,
      branchId: (input.branchId as string) || null,
      departmentId: (input.departmentId as string) || null,
      positionId: (input.positionId as string) || null,
      managerId: (input.managerId as string) || null,
      employmentDate: input.employmentDate ? String(input.employmentDate) : now(),
      terminationDate: null,
      status: (input.status as string) || 'active',
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.employees.push(emp)
    saveData(data)
    return emp
  }

  updateEmployee(id: string, changes: Record<string, unknown>): DevEmployee | undefined {
    const data = loadData()
    const idx = data.employees.findIndex(e => e._id === id)
    if (idx === -1) return undefined
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(changes)) {
      if (v !== undefined) cleaned[k] = v
    }
    data.employees[idx] = { ...data.employees[idx], ...cleaned, updatedAt: now() } as DevEmployee
    saveData(data)
    return data.employees[idx]
  }

  archiveEmployee(id: string): boolean {
    const data = loadData()
    const emp = data.employees.find(e => e._id === id)
    if (!emp) return false
    emp.isDeleted = true
    emp.deletedAt = now()
    emp.updatedAt = now()
    saveData(data)
    return true
  }

  restoreEmployee(id: string): boolean {
    const data = loadData()
    const emp = data.employees.find(e => e._id === id)
    if (!emp) return false
    emp.isDeleted = false
    emp.deletedAt = null
    emp.updatedAt = now()
    saveData(data)
    return true
  }

  // Contracts
  getContracts(employeeId?: string): DevContract[] {
    const all = loadData().contracts.filter(c => !c.isDeleted)
    return employeeId ? all.filter(c => c.employeeId === employeeId) : all
  }

  createContract(input: Record<string, unknown>): DevContract {
    const data = loadData()
    const contract: DevContract = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      contractNumber: (input.contractNumber as string) || `CTR-${String(data.contracts.length + 1).padStart(3, '0')}`,
      type: (input.type as string) || 'full-time',
      startDate: input.startDate ? String(input.startDate) : now(),
      endDate: input.endDate ? String(input.endDate) : null,
      salary: (input.salary as number) || null,
      status: (input.status as string) || 'active',
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.contracts.push(contract)
    saveData(data)
    return contract
  }

  updateContract(id: string, changes: Record<string, unknown>): DevContract | undefined {
    const data = loadData()
    const idx = data.contracts.findIndex(c => c._id === id)
    if (idx === -1) return undefined
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(changes)) {
      if (v !== undefined) cleaned[k] = v
    }
    data.contracts[idx] = { ...data.contracts[idx], ...cleaned, updatedAt: now() } as DevContract
    saveData(data)
    return data.contracts[idx]
  }

  archiveContract(id: string): boolean {
    const data = loadData()
    const c = data.contracts.find(c => c._id === id)
    if (!c) return false
    c.isDeleted = true
    c.deletedAt = now()
    c.updatedAt = now()
    saveData(data)
    return true
  }

  // Documents
  getDocuments(employeeId: string): DevDocument[] {
    return loadData().documents.filter(d => !d.isDeleted && d.employeeId === employeeId)
  }

  createDocument(input: Record<string, unknown>): DevDocument {
    const data = loadData()
    const doc: DevDocument = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      name: (input.name as string) || '',
      type: (input.type as string) || '',
      fileUrl: (input.fileUrl as string) || null,
      expiryDate: input.expiryDate ? String(input.expiryDate) : null,
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.documents.push(doc)
    saveData(data)
    return doc
  }

  archiveDocument(id: string): boolean {
    const data = loadData()
    const doc = data.documents.find(d => d._id === id)
    if (!doc) return false
    doc.isDeleted = true
    doc.deletedAt = now()
    saveData(data)
    return true
  }

  // Emergency Contacts
  getEmergencyContacts(employeeId: string): DevEmergencyContact[] {
    return loadData().emergencyContacts.filter(c => !c.isDeleted && c.employeeId === employeeId)
  }

  createEmergencyContact(input: Record<string, unknown>): DevEmergencyContact {
    const data = loadData()
    const contact: DevEmergencyContact = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      name: (input.name as string) || '',
      phone: (input.phone as string) || '',
      relationship: (input.relationship as string) || '',
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.emergencyContacts.push(contact)
    saveData(data)
    return contact
  }

  archiveEmergencyContact(id: string): boolean {
    const data = loadData()
    const c = data.emergencyContacts.find(c => c._id === id)
    if (!c) return false
    c.isDeleted = true
    c.deletedAt = now()
    saveData(data)
    return true
  }

  // Education
  getEducation(employeeId: string): DevEducation[] {
    return loadData().education.filter(e => !e.isDeleted && e.employeeId === employeeId)
  }

  createEducation(input: Record<string, unknown>): DevEducation {
    const data = loadData()
    const edu: DevEducation = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      institution: (input.institution as string) || '',
      degree: (input.degree as string) || '',
      fieldOfStudy: (input.fieldOfStudy as string) || '',
      startDate: input.startDate ? String(input.startDate) : null,
      endDate: input.endDate ? String(input.endDate) : null,
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.education.push(edu)
    saveData(data)
    return edu
  }

  archiveEducation(id: string): boolean {
    const data = loadData()
    const e = data.education.find(e => e._id === id)
    if (!e) return false
    e.isDeleted = true
    e.deletedAt = now()
    saveData(data)
    return true
  }

  // Experience
  getExperience(employeeId: string): DevExperience[] {
    return loadData().experience.filter(e => !e.isDeleted && e.employeeId === employeeId)
  }

  createExperience(input: Record<string, unknown>): DevExperience {
    const data = loadData()
    const exp: DevExperience = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      company: (input.company as string) || '',
      title: (input.title as string) || '',
      startDate: input.startDate ? String(input.startDate) : null,
      endDate: input.endDate ? String(input.endDate) : null,
      description: (input.description as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.experience.push(exp)
    saveData(data)
    return exp
  }

  archiveExperience(id: string): boolean {
    const data = loadData()
    const e = data.experience.find(e => e._id === id)
    if (!e) return false
    e.isDeleted = true
    e.deletedAt = now()
    saveData(data)
    return true
  }

  // Skills
  getSkills(employeeId: string): DevSkill[] {
    return loadData().skills.filter(s => !s.isDeleted && s.employeeId === employeeId)
  }

  createSkill(input: Record<string, unknown>): DevSkill {
    const data = loadData()
    const skill: DevSkill = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      name: (input.name as string) || '',
      level: (input.level as string) || 'intermediate',
      category: (input.category as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.skills.push(skill)
    saveData(data)
    return skill
  }

  archiveSkill(id: string): boolean {
    const data = loadData()
    const s = data.skills.find(s => s._id === id)
    if (!s) return false
    s.isDeleted = true
    s.deletedAt = now()
    saveData(data)
    return true
  }

  // Counts
  getEmployeeCount(): number {
    return this.getEmployees().length
  }

  getActiveEmployeeCount(): number {
    return this.getEmployees().filter(e => e.status === 'active').length
  }
}

export const devEmployeeService = new DevEmployeeServiceClass()
