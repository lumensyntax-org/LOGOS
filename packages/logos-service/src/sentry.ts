/**
 * Sentry Error Tracking Configuration
 *
 * Captures errors, exceptions, and performance metrics
 */

import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry() {
  const sentryDsn = process.env.SENTRY_DSN;

  // Skip initialization if no DSN is provided
  if (!sentryDsn) {
    console.log('Sentry DSN not configured, skipping error tracking');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release tracking (for correlating errors with deployments)
    release: process.env.APP_VERSION || '0.1.0',

    // Performance monitoring sample rate (0.0 to 1.0)
    // In production: 0.1 means 10% of transactions are sampled
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Profiling sample rate (0.0 to 1.0)
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),

    // Don't send errors in development unless explicitly enabled
    enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true',

    // Tag all events with service name
    initialScope: {
      tags: {
        service: 'logos-service',
        component: 'christological-verification'
      }
    },

    // Before send hook to add custom context
    beforeSend(event, hint) {
      // Add LOGOS-specific context
      if (hint.originalException) {
        const error = hint.originalException as any;

        // Add verification context if available
        if (error.verificationContext) {
          event.contexts = event.contexts || {};
          event.contexts.logos = error.verificationContext;
        }
      }

      return event;
    },

    // Filter out certain errors
    ignoreErrors: [
      // Ignore validation errors (they're expected)
      'Validation Error',
      // Ignore rate limit errors
      'Too Many Requests',
      // Ignore client disconnects
      'ECONNRESET',
      'EPIPE'
    ]
  });

  console.log(`Sentry initialized (${process.env.NODE_ENV})`);
}

/**
 * Capture a verification error with LOGOS context
 */
export function captureVerificationError(
  error: Error,
  context: {
    decision?: string;
    confidence?: number;
    gap?: any;
    source?: any;
    manifestation?: any;
  }
) {
  Sentry.withScope((scope) => {
    // Add LOGOS-specific context
    scope.setContext('verification', {
      decision: context.decision,
      confidence: context.confidence,
      gapOverall: context.gap?.overall,
      gapDominantType: context.gap?.dominantType
    });

    // Add tags for filtering
    if (context.decision) {
      scope.setTag('decision', context.decision);
    }
    if (context.gap?.dominantType) {
      scope.setTag('gap_type', context.gap.dominantType);
    }

    // Set level based on decision
    if (context.decision === 'BLOCK') {
      scope.setLevel('warning');
    } else {
      scope.setLevel('error');
    }

    Sentry.captureException(error);
  });
}

/**
 * Start a new Sentry transaction for performance tracking
 */
export function startVerificationTransaction(intent: string) {
  return Sentry.startTransaction({
    op: 'verification',
    name: 'LOGOS Verification',
    data: {
      intent: intent.substring(0, 100) // Limit to 100 chars
    }
  });
}

/**
 * Capture a message with context
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(userId: string, metadata?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    ...metadata
  });
}

/**
 * Flush Sentry queue (useful for graceful shutdown)
 */
export async function flushSentry(timeout = 2000) {
  await Sentry.close(timeout);
}

export { Sentry };
