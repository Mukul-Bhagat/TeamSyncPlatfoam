# Project Collaboration Module - Security Architecture

## Overview

This document defines the comprehensive security architecture for the Project Collaboration Module. Security is implemented at multiple layers: authentication, authorization, data encryption, network security, and compliance.

## Security Layers

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│  - Input Validation                      │
│  - Rate Limiting                         │
│  - CSRF Protection                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Authentication Layer             │
│  - JWT Tokens                            │
│  - Session Management                    │
│  - MFA Support                           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Authorization Layer              │
│  - Role-Based Access Control (RBAC)     │
│  - Permission Checks                     │
│  - Row Level Security (RLS)             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Data Layer                        │
│  - Encryption at Rest                    │
│  - Encryption in Transit                 │
│  - Data Masking                          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Network Layer                     │
│  - TLS/SSL                               │
│  - Firewall Rules                         │
│  - DDoS Protection                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Infrastructure Layer              │
│  - VPC Isolation                         │
│  - Security Groups                        │
│  - Audit Logging                         │
└─────────────────────────────────────────┘
```

---

## Authentication

### Supabase Auth Integration

The module uses Supabase Auth for authentication:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### JWT Token Structure

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "https://dnyxzqexlutfezyskwrs.supabase.co",
  "sub": "uuid",
  "email": "user@example.com",
  "phone": "",
  "role": "authenticated",
  "user_metadata": {
    "full_name": "John Doe",
    "avatar_url": "https://..."
  }
}
```

### Token Validation

```typescript
async function validateToken(token: string): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    return null
  }
}
```

### Session Management

```typescript
// Session middleware
async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const user = await validateToken(token)
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  req.user = user
  next()
}
```

### Multi-Factor Authentication (MFA) - Future

```typescript
// Enable MFA
await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'My Authenticator App'
})

// Verify MFA
await supabase.auth.mfa.verify({
  factorId: 'uuid',
  code: '123456'
})
```

---

## Authorization

### Role-Based Access Control (RBAC)

```typescript
interface PermissionCheck {
  userId: string
  projectId: string
  action: string
  resource?: string
}

async function checkPermission(check: PermissionCheck): Promise<boolean> {
  const member = await getProjectMember(check.userId, check.projectId)
  
  if (!member || member.status !== 'active') {
    return false
  }
  
  const role = member.role
  const permissions = PERMISSION_MATRIX[role]
  
  return permissions?.[check.action] || false
}
```

### Permission Middleware

```typescript
function requirePermission(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user
    const { projectId } = req.params
    
    const hasPermission = await checkPermission({
      userId,
      projectId,
      action
    })
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    
    next()
  }
}

// Usage
router.post(
  '/projects/:id/channels',
  sessionMiddleware,
  requirePermission('create_channels'),
  createChannelHandler
)
```

### Resource-Level Authorization

```typescript
async function checkResourceOwnership(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  switch (resourceType) {
    case 'message':
      const message = await getMessage(resourceId)
      return message.sender_id === userId
    
    case 'file':
      const file = await getFile(resourceId)
      return file.uploaded_by === userId
    
    case 'meeting':
      const meeting = await getMeeting(resourceId)
      return meeting.organizer_id === userId
    
    default:
      return false
  }
}
```

---

## Row Level Security (RLS)

### RLS Policy Pattern

```sql
-- Enable RLS on table
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in their projects
CREATE POLICY "Users can view project messages" ON public.project_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_messages.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
    AND deleted_at IS NULL
  );

-- Policy: Project members can create messages
CREATE POLICY "Project members can create messages" ON public.project_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_messages.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Policy: Message senders can update their messages
CREATE POLICY "Message senders can update" ON public.project_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Policy: Message senders can soft delete their messages
CREATE POLICY "Message senders can delete" ON public.project_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  );
```

### Role-Based RLS Policies

```sql
-- Owner/Admin can delete any content
CREATE POLICY "Owners and admins can delete any message" ON public.project_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_messages.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );
```

### Security-Definer Functions

```sql
-- Function that runs with elevated privileges
CREATE OR REPLACE FUNCTION public.get_project_statistics(p_project_id UUID)
RETURNS TABLE (
  total_members INTEGER,
  total_messages INTEGER,
  total_files INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.project_members WHERE project_id = p_project_id AND status = 'active')::INTEGER,
    (SELECT COUNT(*) FROM public.project_messages WHERE project_id = p_project_id AND deleted_at IS NULL)::INTEGER,
    (SELECT COUNT(*) FROM public.project_files WHERE project_id = p_project_id AND deleted_at IS NULL)::INTEGER;
END;
$$;
```

---

## Data Encryption

### Encryption at Rest

Supabase automatically encrypts data at rest using AES-256 encryption. Additional encryption for sensitive fields:

```sql
-- Encrypt sensitive metadata using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt meeting provider tokens
ALTER TABLE public.project_meetings
  ADD COLUMN encrypted_provider_token TEXT;

-- Function to encrypt
CREATE OR REPLACE FUNCTION public.encrypt_token(p_token TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    encrypt(
      p_token::bytea,
      'encryption_key'::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt
CREATE OR REPLACE FUNCTION public.decrypt_token(p_encrypted_token TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(p_encrypted_token, 'base64'),
      'encryption_key'::bytea,
      'aes'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Encryption in Transit

All API communications use TLS 1.3:

```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(`https://${req.headers.host}${req.url}`)
}
```

### File Storage Encryption

```typescript
// Encrypt file before upload
async function encryptFile(file: Buffer, key: string): Promise<Buffer> {
  const algorithm = 'aes-256-gcm'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  const encrypted = Buffer.concat([
    cipher.update(file),
    cipher.final()
  ])
  
  const authTag = cipher.getAuthTag()
  
  return Buffer.concat([iv, authTag, encrypted])
}

// Decrypt file after download
async function decryptFile(encryptedFile: Buffer, key: string): Promise<Buffer> {
  const algorithm = 'aes-256-gcm'
  const iv = encryptedFile.slice(0, 16)
  const authTag = encryptedFile.slice(16, 32)
  const encrypted = encryptedFile.slice(32)
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
}
```

---

## Input Validation

### Request Validation

```typescript
import { z } from 'zod'

// Message creation schema
const createMessageSchema = z.object({
  type: z.enum(['text', 'image', 'pdf', 'document', 'audio', 'voice_note', 'video', 'spreadsheet', 'link', 'meeting_link', 'system']),
  content: z.string().max(10000).optional(),
  parent_message_id: z.string().uuid().optional(),
  thread_id: z.string().uuid().optional(),
  mentioned_users: z.array(z.string().uuid()).default([]),
  mentioned_all: z.boolean().default(false),
  attachments: z.array(z.object({
    file_name: z.string().max(255),
    file_type: z.string().max(50),
    file_size: z.number().max(100 * 1024 * 1024), // 100MB max
    file_url: z.string().url(),
    storage_provider: z.string()
  })).default([])
})

// Validate request
const validatedData = createMessageSchema.parse(req.body)
```

### SQL Injection Prevention

```typescript
// Use parameterized queries (Supabase client handles this)
const { data, error } = await supabase
  .from('project_messages')
  .select('*')
  .eq('channel_id', channelId)
  .order('created_at', { ascending: false })
  .limit(50)
```

### XSS Prevention

```typescript
import DOMPurify from 'dompurify'

// Sanitize user input
const sanitizedContent = DOMPurify.sanitize(userInput.content)
```

### CSRF Protection

```typescript
import csrf from 'csurf'

const csrfProtection = csrf({ cookie: true })

app.use(csrfProtection)

// Generate CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Validate CSRF token on state-changing requests
app.post('/api/messages', csrfProtection, createMessageHandler)
```

---

## Rate Limiting

### Rate Limiting Strategy

```typescript
import rateLimit from 'express-rate-limit'

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests from this IP'
})

// API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests'
})

// Message creation rate limit (prevent spam)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: 'Too many messages'
})

app.use('/api', apiLimiter)
app.use('/api/v1/projects/:id/channels/:channel_id/messages', messageLimiter)
```

### Redis-Based Rate Limiting (Production)

```typescript
import Redis from 'ioredis'
import { RateLimiterRedis } from 'rate-limiter-flexible'

const redis = new Redis(process.env.REDIS_URL)

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rate_limit',
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
})

async function checkRateLimit(userId: string): Promise<void> {
  try {
    await rateLimiter.consume(userId)
  } catch (rejRes) {
    throw new Error('Rate limit exceeded')
  }
}
```

---

## Security Headers

```typescript
import helmet from 'helmet'

app.use(helmet())

// Custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  next()
})
```

---

## Audit Logging

### Immutable Audit Logs

```sql
-- Audit logs table (no DELETE policy)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  workspace_id UUID,
  organization_id UUID,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- No DELETE policy - audit logs are immutable
CREATE POLICY "No delete on audit logs" ON public.audit_logs
  FOR DELETE USING (false);
```

### Activity Logging Middleware

```typescript
async function auditLog(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send
  
  res.send = function(data) {
    if (req.method !== 'GET' && res.statusCode < 400) {
      logActivity({
        userId: req.user.id,
        action: `${req.method} ${req.path}`,
        entity_type: getEntityType(req.path),
        entity_id: getEntityId(req.params),
        before_data: req.body.before,
        after_data: req.body.after
      })
    }
    
    originalSend.call(this, data)
  }
  
  next()
}
```

---

## Compliance

### GDPR Compliance

```typescript
// Data export endpoint
async function exportUserData(userId: string): Promise<Buffer> {
  const userData = {
    profile: await getProfile(userId),
    projectMemberships: await getProjectMemberships(userId),
    messages: await getUserMessages(userId),
    files: await getUserFiles(userId),
    activityLogs: await getUserActivityLogs(userId)
  }
  
  return JSON.stringify(userData, null, 2)
}

// Data deletion endpoint
async function deleteUserData(userId: string): Promise<void> {
  // Soft delete user data
  await softDeleteUserMessages(userId)
  await softDeleteUserFiles(userId)
  await removeFromAllProjects(userId)
  
  // Delete profile
  await deleteProfile(userId)
}
```

### HIPAA Compliance (Future)

```typescript
// Encrypt PHI (Protected Health Information)
async function encryptPHI(data: string): Promise<string> {
  const key = await getHIPAAEncryptionKey()
  return encrypt(data, key)
}

// Audit access to PHI
async function logPHIAccess(userId: string, resourceId: string): Promise<void> {
  await auditLog({
    userId,
    action: 'phi_access',
    entity_type: 'phi_data',
    entity_id: resourceId,
    metadata: {
      timestamp: new Date().toISOString(),
      ip_address: getClientIP()
    }
  })
}
```

### SOC 2 Compliance

```typescript
// Implement SOC 2 controls
const SOC2_CONTROLS = {
  access_control: true,
  encryption: true,
  audit_logging: true,
  change_management: true,
  incident_response: true
}

// Regular security audits
async function runSecurityAudit(): Promise<AuditReport> {
  return {
    access_controls: await auditAccessControls(),
    encryption_status: await auditEncryption(),
    log_integrity: await auditLogIntegrity(),
    vulnerabilities: await scanVulnerabilities()
  }
}
```

---

## Security Monitoring

### Intrusion Detection

```typescript
// Detect suspicious patterns
async function detectSuspiciousActivity(userId: string): Promise<boolean> {
  const recentActivity = await getRecentActivity(userId, 5) // 5 minutes
  
  // Check for rapid message creation
  const messageCount = recentActivity.filter(a => a.action === 'message_created').length
  if (messageCount > 50) {
    await flagSuspiciousUser(userId, 'rapid_messaging')
    return true
  }
  
  // Check for unusual file uploads
  const fileUploads = recentActivity.filter(a => a.action === 'file_uploaded').length
  if (fileUploads > 20) {
    await flagSuspiciousUser(userId, 'rapid_uploads')
    return true
  }
  
  return false
}
```

### Security Alerts

```typescript
async function sendSecurityAlert(alert: SecurityAlert): Promise<void> {
  await notifySecurityTeam({
    severity: alert.severity,
    message: alert.message,
    details: alert.details,
    timestamp: new Date().toISOString()
  })
}
```

---

## Best Practices

### Password Security

- Use Supabase Auth for password management
- Enforce strong password policies
- Implement password hashing (handled by Supabase)
- Support password reset flows

### API Security

- Never expose sensitive data in API responses
- Use environment variables for secrets
- Implement proper error handling (don't expose stack traces)
- Validate all input parameters
- Use parameterized queries

### File Upload Security

```typescript
// Validate file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']

function validateFileType(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType)
}

// Scan files for malware (integration with virus scanning service)
async function scanForMalware(file: Buffer): Promise<boolean> {
  const result = await virusScanner.scan(file)
  return result.isClean
}

// Generate secure file URLs with expiration
async function generateSecureFileUrl(fileId: string): Promise<string> {
  const token = jwt.sign(
    { fileId, exp: Math.floor(Date.now() / 1000) + 3600 }, // 1 hour
    process.env.FILE_URL_SECRET
  )
  
  return `${process.env.CDN_URL}/files/${fileId}?token=${token}`
}
```

### WebSocket Security

```typescript
// Authenticate WebSocket connections
wss.on('connection', async (ws, req) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    ws.close(4001, 'Unauthorized')
    return
  }
  
  const user = await validateToken(token)
  
  if (!user) {
    ws.close(4001, 'Unauthorized')
    return
  }
  
  ws.user = user
  
  // Validate project access
  const projectId = req.headers['x-project-id'] as string
  const hasAccess = await checkProjectAccess(user.id, projectId)
  
  if (!hasAccess) {
    ws.close(4003, 'Forbidden')
    return
  }
  
  ws.projectId = projectId
})
```

---

## Incident Response

### Security Incident Response Plan

1. **Detection**: Automated monitoring and alerts
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat and vulnerabilities
4. **Recovery**: Restore systems and data
5. **Lessons Learned**: Document and improve

### Incident Logging

```typescript
async function logSecurityIncident(incident: SecurityIncident): Promise<void> {
  await db.security_incidents.create({
    type: incident.type,
    severity: incident.severity,
    description: incident.description,
    affected_users: incident.affectedUsers,
    mitigation_steps: incident.mitigationSteps,
    status: 'open',
    created_at: new Date()
  })
}
```

---

## Future Security Enhancements

### AI-Powered Security

- Anomaly detection using machine learning
- Automated threat response
- Behavioral biometrics
- Natural language processing for threat detection

### Zero Trust Architecture

- Continuous authentication
- Micro-segmentation
- Least privilege access
- Device trust scoring

### Blockchain for Audit Trails

- Immutable audit logs using blockchain
- Cryptographic proof of data integrity
- Decentralized verification

---

## Security Checklist

### Development
- [ ] All inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Error handling doesn't expose sensitive data

### Deployment
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database encryption enabled
- [ ] Backup encryption enabled
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] Monitoring and alerting configured

### Operations
- [ ] Regular security audits
- [ ] Vulnerability scanning
- [ ] Penetration testing
- [ ] Incident response plan tested
- [ ] Security training for team
- [ ] Compliance documentation maintained
