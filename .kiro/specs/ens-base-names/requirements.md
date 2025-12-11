# ENS and Base Name Resolution - Requirements Document

## Introduction

Enhance Perfect? with ENS (Ethereum Name Service) and Base name resolution to display human-readable names instead of wallet addresses throughout the application. This improves user experience by showing familiar names like "alice.eth" or "bob.base.eth" instead of cryptic hexadecimal addresses.

## Glossary

- **ENS**: Ethereum Name Service - decentralized naming system for Ethereum addresses
- **Base Names**: Base network's naming service for human-readable addresses
- **Name Resolution**: Process of converting wallet addresses to human-readable names
- **Reverse Resolution**: Looking up a name from a wallet address
- **Primary Name**: The main name associated with a wallet address
- **Leaderboard System**: The ranking display showing top players
- **Stats Panel**: User statistics display in the main menu
- **AppKit Button**: Wallet connection component showing user info

## Requirements

### Requirement 1

**User Story:** As a player, I want to see my ENS or Base name displayed instead of my wallet address, so I can easily identify myself in the game interface.

#### Acceptance Criteria

1. WHEN a user connects a wallet with an associated ENS name, THE system SHALL display the ENS name in the AppKit button
2. WHEN a user connects a wallet with an associated Base name, THE system SHALL display the Base name in the AppKit button
3. WHEN a user has both ENS and Base names, THE system SHALL prioritize ENS names over Base names
4. WHEN a user has no associated names, THE system SHALL display the truncated wallet address as fallback
5. WHERE name resolution fails or times out, THE system SHALL gracefully fallback to displaying the wallet address

### Requirement 2

**User Story:** As a player viewing the leaderboard, I want to see other players' ENS or Base names, so I can recognize friends and familiar players more easily.

#### Acceptance Criteria

1. WHEN the leaderboard displays player rankings, THE system SHALL resolve and display ENS or Base names for each wallet address
2. WHEN a player has an associated name, THE system SHALL display the name with a small wallet address underneath for verification
3. WHEN name resolution is pending, THE system SHALL show a loading indicator while maintaining the wallet address display
4. WHEN multiple players have the same display name, THE system SHALL append the last 4 characters of their wallet address for disambiguation
5. WHERE batch resolution is needed, THE system SHALL process names efficiently to avoid performance degradation

### Requirement 3

**User Story:** As a player, I want name resolution to work quickly and reliably, so the interface remains responsive and doesn't feel sluggish.

#### Acceptance Criteria

1. WHEN resolving a single name, THE system SHALL complete the resolution within 2 seconds
2. WHEN resolving multiple names for the leaderboard, THE system SHALL use batch processing to resolve up to 10 names simultaneously
3. WHEN name resolution fails, THE system SHALL cache the failure for 5 minutes to avoid repeated failed requests
4. WHEN a name is successfully resolved, THE system SHALL cache the result for 1 hour to improve performance
5. WHERE the user is offline or network requests fail, THE system SHALL use cached results when available

### Requirement 4

**User Story:** As a developer, I want the name resolution system to be extensible, so we can easily add support for other naming services in the future.

#### Acceptance Criteria

1. WHEN implementing name resolution, THE system SHALL use a provider pattern that supports multiple naming services
2. WHEN adding new naming services, THE system SHALL allow registration of new providers without modifying existing code
3. WHEN resolving names, THE system SHALL check providers in priority order (ENS first, then Base names, then others)
4. WHEN a provider fails, THE system SHALL automatically try the next provider in the priority list
5. WHERE configuration is needed, THE system SHALL allow enabling/disabling specific providers through settings

### Requirement 5

**User Story:** As a player, I want to see name resolution working in the stats panel and profile areas, so my identity is consistent throughout the application.

#### Acceptance Criteria

1. WHEN viewing the main menu stats panel, THE system SHALL display the user's resolved name
2. WHEN viewing the profile page, THE system SHALL show the resolved name as the primary identifier
3. WHEN displaying game results or achievements, THE system SHALL use resolved names consistently
4. WHEN sharing scores or achievements, THE system SHALL include the resolved name in shared content
5. WHERE names are displayed, THE system SHALL provide a tooltip showing the full wallet address on hover

## Technical Considerations

### ENS Resolution

- Use official ENS contracts on Ethereum mainnet
- Support both forward and reverse resolution
- Handle subdomain resolution (e.g., "alice.example.eth")
- Respect ENS text records for additional metadata

### Base Names Resolution

- Integrate with Base network's naming service
- Support Base-specific name formats
- Handle Base network RPC calls efficiently
- Cache Base name resolutions appropriately

### Performance Requirements

- Single name resolution: < 2 seconds
- Batch resolution: < 5 seconds for 10 names
- Cache hit rate: > 80% for frequently accessed names
- Memory usage: < 10MB for name cache

### Error Handling

- Network timeouts and failures
- Invalid name formats
- Non-existent names
- Rate limiting from providers
- Graceful degradation to wallet addresses

### Privacy Considerations

- No logging of wallet addresses or resolved names
- Respect user preferences for name display
- Allow users to opt-out of name resolution
- Clear cache on wallet disconnect
