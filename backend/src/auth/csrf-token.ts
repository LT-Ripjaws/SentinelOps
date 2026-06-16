import { createHmac, randomBytes, timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function createSignedCsrfToken(secret: string, sid: string): string {
    const randomValue = randomBytes(32).toString('hex')

    const signature = createHmac('sha256', secret).update(`${sid}.${randomValue}`).digest('hex')
   
    return `${signature}.${randomValue}`
}

export function verifySignedCsrfToken(secret: string, sid: string, token: string): boolean {

    const [signature, randomValue] = token.split('.')

    if(!signature || !randomValue){
        return false;
    }

    const expectedSignature = createHmac('sha256', secret)
    .update(`${sid}.${randomValue}`)
    .digest('hex');

    return safeCompare(signature, expectedSignature);
}
