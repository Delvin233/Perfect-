# ENS and Base Name Resolution - Design Document

## Overview

This document outlines the technical design for implementing ENS and Base name resolution in Perfect?, based on proven patterns from the rps-onchain project. The system will replace truncated wallet addresses with human-readable names throughout the application, improving user experience and recognition.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Hooks   │    │   API Routes     │    │   External APIs │
│                 │    │                  │    │                 │
│ useDisplayName  │◄──►│ /api/resolve-name│◄──►│ ENS Resolver    │
│ useBasename     │    │ /api/basename    │    │ Alchemy API     │
│ useAddressDisplay│    │                  │    │ (Base Names)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Components    │    │   Cache Layer    │
│                 │    │                  │
│ Leaderboard     │    │ In-Memory Cache  │
│ Stats Panel     │    │ 1-hour TTL       │
│ AppKit Button   │    │ 5-min failures   │
└─────────────────┘    └──────────────────┘
```

### Resolution Priority

1. **ENS Names** (Ethereum mainnet) - Highest priority
2. **Base Names** (Base network) - Second priority
3. **Truncated Address** - Fallback

## Components and Interfaces

### React Hooks

#### useDisplayName Hook

Primary hook for resolving the current user's display name.

```typescript
interface UseDisplayNameReturn {
  displayName: string;
  hasEns: boolean;
  ensType: "mainnet" | "basename" | null;
  fullAddress: string | undefined;
  isLoading: boolean;
}

export function useDisplayName(
  address: string | undefined,
): UseDisplayNameReturn;
```

**Features:**

- Integrates with wagmi for ENS resolution
- Calls `/api/basename` for Base names
- Returns loading states
- Caches results using React Query

#### useAddressDisplay Hook

Hook for resolving any address (not just current user).

```typescript
interface UseAddressDisplayReturn {
  displayName: string;
  source: "ens" | "basename" | "wallet";
  isLoading: boolean;
}

export function useAddressDisplay(
  address: string | null | undefined,
): UseAddressDisplayReturn;
```

**Features:**

- Used for leaderboards, match history, profiles
- Handles null/undefined addresses gracefully
- Provides source information for UI styling

#### useBatchAddressDisplay Hook

Hook for resolving multiple addresses efficiently.

```typescript
interface UseBatchAddressDisplayReturn {
  displayNames: Map<string, string>;
  sources: Map<string, "ens" | "basename" | "wallet">;
  isLoading: boolean;
}

export function useBatchAddressDisplay(
  addresses: string[],
): UseBatchAddressDisplayReturn;
```

**Features:**

- Batch processing for performance
- Used by leaderboard component
- Reduces API calls through intelligent batching

### API Routes

#### /api/resolve-name

Primary name resolution endpoint.

```typescript
// GET /api/resolve-name?address=0x1234...
interface ResolveNameResponse {
  name: string | null;
  source: "ens" | "basename" | null;
}
```

**Implementation:**

1. Try ENS resolution using viem client
2. Try Base name resolution using Alchemy API
3. Return first successful result
4. Cache results server-side

#### /api/basename

Dedicated Base name resolution endpoint.

```typescript
// GET /api/basename?address=0x1234...
interface BasenameResponse {
  name: string | null;
}
```

**Implementation:**

- Uses Alchemy NFT API to check Base name ownership
- Queries Base name contract: `0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a`
- Returns the name from NFT metadata

#### /api/batch-resolve

Batch resolution endpoint for multiple addresses.

```typescript
// POST /api/batch-resolve
interface BatchResolveRequest {
  addresses: string[];
}

interface BatchResolveResponse {
  results: Record<
    string,
    {
      name: string | null;
      source: "ens" | "basename" | null;
    }
  >;
}
```

**Implementation:**

- Accepts up to 50 addresses per request
- Processes in parallel with rate limiting
- Returns map of address to resolved name

## Data Models

### Name Resolution Result

```typescript
interface NameResolution {
  address: string;
  name: string | null;
  source: "ens" | "basename" | "wallet";
  timestamp: number;
  isLoading?: boolean;
}
```

### Cache Entry

```typescript
interface CacheEntry {
  name: string | null;
  source: "ens" | "basename" | null;
  timestamp: number;
  expiresAt: number;
}
```

### Display Name Context

```typescript
interface DisplayNameContextValue {
  getDisplayName: (address: string) => Promise<NameResolution>;
  getBatchDisplayNames: (
    addresses: string[],
  ) => Promise<Map<string, NameResolution>>;
  clearCache: () => void;
  cacheStats: () => { size: number; hitRate: number };
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Name Resolution Consistency

_For any_ valid Ethereum address, resolving the name multiple times within the cache TTL should return the same result
**Validates: Requirements 3.4**

### Property 2: Priority Order Enforcement

_For any_ address with multiple name types available, the system should always return ENS names over Base names over truncated addresses
**Validates: Requirements 1.3**

### Property 3: Fallback Reliability

_For any_ address where name resolution fails or times out, the system should return a properly formatted truncated address
**Validates: Requirements 1.4, 1.5**

### Property 4: Cache Expiration Correctness

_For any_ cached name resolution, accessing the name after the TTL expires should trigger a fresh resolution attempt
**Validates: Requirements 3.3, 3.4**

### Property 5: Batch Resolution Completeness

_For any_ batch of addresses submitted for resolution, the response should contain an entry for every input address
**Validates: Requirements 2.5**

### Property 6: Address Format Validation

_For any_ input that is not a valid Ethereum address format, the system should reject the request gracefully
**Validates: Requirements 1.4**

## Error Handling

### Network Failures

- **Timeout Handling**: 5-second timeout for all external API calls
- **Retry Logic**: Exponential backoff with max 3 retries
- **Circuit Breaker**: Disable failing providers temporarily
- **Graceful Degradation**: Always return truncated address as fallback

### API Rate Limiting

- **Alchemy API**: Respect rate limits with exponential backoff
- **ENS Resolution**: Use public RPC with fallback providers
- **Request Queuing**: Queue requests during rate limit periods

### Invalid Inputs

- **Address Validation**: Validate Ethereum address format
- **Sanitization**: Lowercase addresses for consistency
- **Error Responses**: Return structured error messages

### Cache Failures

- **Memory Pressure**: Implement LRU eviction policy
- **Corruption Recovery**: Validate cache entries on read
- **Fallback Strategy**: Skip cache on persistent failures

## Testing Strategy

### Unit Testing

- Test each hook with various address formats
- Mock external API responses
- Verify error handling paths
- Test cache behavior

### Property-Based Testing

- Generate random valid Ethereum addresses
- Test resolution consistency across multiple calls
- Verify priority order with addresses having multiple names
- Test batch resolution completeness

### Integration Testing

- Test against real ENS and Base name contracts
- Verify API endpoint responses
- Test caching behavior end-to-end
- Performance testing with large batches

### Testing Framework

- **Property Testing**: Use `fast-check` for property-based tests
- **Unit Testing**: Jest with React Testing Library
- **API Testing**: Supertest for endpoint testing
- **E2E Testing**: Playwright for full user flows

## Implementation Plan

### Phase 1: Core Infrastructure

1. Create name resolution library (`lib/nameResolver.ts`)
2. Implement basic API routes (`/api/resolve-name`, `/api/basename`)
3. Add caching layer with TTL management
4. Create basic React hooks (`useDisplayName`, `useAddressDisplay`)

### Phase 2: Integration

1. Replace truncated addresses in leaderboard component
2. Update stats panel to show resolved names
3. Integrate with AppKit button component
4. Add loading states and error handling

### Phase 3: Optimization

1. Implement batch resolution API and hook
2. Add intelligent caching strategies
3. Optimize for mobile performance
4. Add comprehensive error recovery

### Phase 4: Polish

1. Add hover tooltips showing full addresses
2. Implement name source indicators (ENS badge, etc.)
3. Add settings to disable name resolution
4. Performance monitoring and analytics

## Performance Considerations

### Caching Strategy

- **Client-side**: React Query with 1-hour stale time
- **Server-side**: In-memory cache with 1-hour TTL
- **Failure Cache**: Cache failures for 5 minutes to avoid spam

### Batch Processing

- **Leaderboard**: Batch resolve all visible addresses
- **Pagination**: Pre-fetch names for next page
- **Debouncing**: Debounce rapid address changes

### Network Optimization

- **Request Deduplication**: Avoid duplicate requests for same address
- **Parallel Resolution**: Resolve ENS and Base names in parallel
- **Connection Pooling**: Reuse HTTP connections

### Memory Management

- **Cache Size Limits**: Maximum 1000 entries in memory
- **LRU Eviction**: Remove least recently used entries
- **Garbage Collection**: Periodic cleanup of expired entries

## Security Considerations

### Input Validation

- Validate all addresses using `viem/utils`
- Sanitize inputs to prevent injection attacks
- Rate limit API endpoints per IP

### API Security

- **Environment Variables**: Store API keys securely
- **CORS Configuration**: Restrict API access to app domain
- **Request Validation**: Validate request parameters

### Privacy

- **No Logging**: Don't log wallet addresses or resolved names
- **Cache Isolation**: Separate cache per user session
- **Data Retention**: Clear cache on wallet disconnect

## Configuration

### Environment Variables

```bash
# Alchemy API for Base names
ALCHEMY_API_KEY=your_alchemy_key

# Optional: Custom RPC endpoints
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-key

# Cache configuration
NAME_CACHE_TTL_MS=3600000  # 1 hour
FAILURE_CACHE_TTL_MS=300000  # 5 minutes
MAX_CACHE_SIZE=1000
```

### Feature Flags

```typescript
interface NameResolutionConfig {
  enableENS: boolean;
  enableBaseNames: boolean;
  enableCaching: boolean;
  batchSize: number;
  timeoutMs: number;
}
```

## File Structure

```
lib/
├── nameResolver.ts          # Core resolution logic
├── nameCache.ts            # Caching implementation
└── nameValidation.ts       # Address validation utils

hooks/
├── useDisplayName.ts       # Current user name resolution
├── useAddressDisplay.ts    # Any address resolution
└── useBatchAddressDisplay.ts # Batch resolution

app/api/
├── resolve-name/
│   └── route.ts           # Primary resolution endpoint
├── basename/
│   └── route.ts           # Base name specific endpoint
└── batch-resolve/
    └── route.ts           # Batch resolution endpoint

components/
├── AddressDisplay.tsx      # Reusable address display component
└── NameBadge.tsx          # Name source indicator component

types/
└── nameResolution.ts      # TypeScript interfaces
```

## Migration Strategy

### Gradual Rollout

1. **Phase 1**: Add name resolution to new components only
2. **Phase 2**: Update existing components one by one
3. **Phase 3**: Enable by default with opt-out option
4. **Phase 4**: Remove opt-out, full deployment

### Backward Compatibility

- Keep existing truncated address display as fallback
- Maintain existing component APIs
- Add new props as optional parameters

### Performance Monitoring

- Track resolution success rates
- Monitor API response times
- Measure cache hit rates
- Alert on error rate spikes

## Success Metrics

### Functional Metrics

- **Resolution Success Rate**: > 95% for valid addresses
- **Cache Hit Rate**: > 80% for frequently accessed addresses
- **API Response Time**: < 2 seconds for single resolution
- **Batch Processing**: < 5 seconds for 50 addresses

### User Experience Metrics

- **Loading Time**: Names appear within 1 second
- **Error Rate**: < 1% of resolution attempts fail
- **User Satisfaction**: Improved leaderboard readability

### Technical Metrics

- **Memory Usage**: < 10MB for name cache
- **API Costs**: Minimize Alchemy API calls through caching
- **Error Recovery**: 100% fallback to truncated addresses

## Future Enhancements

### Additional Name Services

- **Unstoppable Domains**: Add .crypto, .nft domain support
- **Lens Protocol**: Social media handle resolution
- **Farcaster**: Username resolution (like rps-onchain)

### Advanced Features

- **Name History**: Track name changes over time
- **Custom Names**: Allow users to set display preferences
- **Social Integration**: Show social media profiles

### Performance Optimizations

- **CDN Caching**: Cache popular names at edge locations
- **Preloading**: Predictive name resolution
- **Compression**: Compress API responses

## Dependencies

### Required

- `viem`: Ethereum client for ENS resolution
- `wagmi`: React hooks for Web3 integration
- `@tanstack/react-query`: Client-side caching

### Optional

- `@alchemy/aa-core`: Enhanced Alchemy integration
- `@ensdomains/ensjs`: Official ENS JavaScript library

### Development

- `fast-check`: Property-based testing
- `jest`: Unit testing framework
- `@testing-library/react`: React component testing

---

**Status**: Ready for Implementation
**Created**: 2025-12-11
**Last Updated**: 2025-12-11
