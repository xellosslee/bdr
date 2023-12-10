import { PrismaClient as ImportedPrismaClient } from '@prisma/client'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const {PrismaClient: RequirePrismaClient} = require('@prisma/client')
const _PrismaClient: typeof ImportedPrismaClient = RequirePrismaClient
export class PrismaClient extends _PrismaClient {}

// bigint로 된 컬럼을 json으로 전달 할 때 string 자료형으로 전달하도록 일괄 적용
// response data에서 string으로 뽑아서 써야 함
(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}
