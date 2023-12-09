import { PrismaClient as ImportedPrismaClient } from '@prisma/client'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {PrismaClient: RequirePrismaClient} = require('@prisma/client')
const _PrismaClient: typeof ImportedPrismaClient = RequirePrismaClient
export class PrismaClient extends _PrismaClient {}

(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}
