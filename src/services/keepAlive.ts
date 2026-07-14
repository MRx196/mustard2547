import { supabase } from '../db/supabase';
import { mockDb } from '../db/mockDb';

interface KeepAliveConfig {
  intervalMs: number; // Configurable interval (default 7 days)
  maxRetries: number;
  backoffBaseMs: number;
}

const DEFAULT_CONFIG: KeepAliveConfig = {
  intervalMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxRetries: 5,
  backoffBaseMs: 2000 // Start retrying after 2 seconds
};

export class DatabaseKeepAliveService {
  private config: KeepAliveConfig;
  private timer: any = null;
  private isChecking = false;

  constructor(config: Partial<KeepAliveConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the periodic checker background loop.
   * This executes silently in the background on startup.
   */
  public start() {
    if (this.timer) return;
    
    // Perform initial check immediately
    this.checkIfDue();

    // Check hourly in case the tab remains open for days
    this.timer = setInterval(() => {
      this.checkIfDue();
    }, 60 * 60 * 1000); 
  }

  /**
   * Stop the background loop
   */
  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Check if the keep-alive interval has expired
   */
  private checkIfDue() {
    if (this.isChecking) return;

    const lastCheckStr = localStorage.getItem('db_last_keep_alive');
    const now = Date.now();

    if (!lastCheckStr) {
      // First run, execute immediately
      this.pingDatabase(0);
    } else {
      const lastCheck = parseInt(lastCheckStr, 10);
      if (now - lastCheck >= this.config.intervalMs) {
        this.pingDatabase(0);
      }
    }
  }

  /**
   * Execute ping read operation on Supabase with exponential backoff on failure
   */
  private async pingDatabase(retryCount: number) {
    this.isChecking = true;
    const systemOperator = {
      name: 'Database Keep-Alive Service',
      email: 'keepalive@mustardseed.org',
      role: 'System'
    };

    try {
      // Perform a lightweight read operation from a system table (e.g. congregations)
      const { error } = await supabase
        .from('congregations')
        .select('id')
        .limit(1);

      if (error) throw error;

      // Update last successful run timestamp
      localStorage.setItem('db_last_keep_alive', Date.now().toString());
      this.isChecking = false;

      // Log success silently to audit logs for monitoring
      mockDb.logAudit(
        systemOperator,
        'Database Keep-Alive Health Check',
        'System',
        'Supabase Conn',
        'Checking...',
        'Success - Database online'
      );
    } catch (err: any) {
      const errMsg = err.message || 'Unknown network error';
      
      // Log warning to audit logs for administrators to see
      mockDb.logAudit(
        systemOperator,
        `Keep-Alive Connection Warning (Attempt ${retryCount + 1})`,
        'System',
        'Supabase Conn',
        'Checking...',
        `Failed: ${errMsg}`
      );

      if (retryCount < this.config.maxRetries) {
        const delay = Math.pow(2, retryCount) * this.config.backoffBaseMs;
        setTimeout(() => {
          this.pingDatabase(retryCount + 1);
        }, delay);
      } else {
        // Log final failure
        mockDb.logAudit(
          systemOperator,
          'Database Keep-Alive Service: Max Retries Exhausted',
          'System',
          'Supabase Conn',
          'Online Check',
          'Offline/Paused - Attention Required'
        );
        this.isChecking = false;
      }
    }
  }
}

// Export singleton instance
export const keepAliveService = new DatabaseKeepAliveService();
