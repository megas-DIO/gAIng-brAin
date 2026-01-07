/**
 * Performance Monitoring System for gAIng-brAin
 *
 * Tracks:
 * - API response times
 * - Memory usage
 * - Database query performance
 * - Error rates
 * - Request throughput
 */

const os = require('os');

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                errors: 0,
                byEndpoint: {}
            },
            responseTimes: {
                min: Infinity,
                max: 0,
                avg: 0,
                p95: 0,
                p99: 0,
                samples: []
            },
            database: {
                queries: 0,
                avgQueryTime: 0,
                slowQueries: []
            },
            system: {
                memory: {
                    used: 0,
                    free: 0,
                    percentage: 0
                },
                cpu: {
                    usage: 0
                }
            }
        };

        this.startTime = Date.now();
        this.requestTimes = [];

        // Start system monitoring
        this.startSystemMonitoring();
    }

    /**
     * Record an API request
     */
    recordRequest(endpoint, duration, success = true) {
        // Update request counts
        this.metrics.requests.total++;
        if (success) {
            this.metrics.requests.success++;
        } else {
            this.metrics.requests.errors++;
        }

        // Track by endpoint
        if (!this.metrics.requests.byEndpoint[endpoint]) {
            this.metrics.requests.byEndpoint[endpoint] = {
                count: 0,
                avgTime: 0,
                totalTime: 0
            };
        }
        const endpointMetrics = this.metrics.requests.byEndpoint[endpoint];
        endpointMetrics.count++;
        endpointMetrics.totalTime += duration;
        endpointMetrics.avgTime = endpointMetrics.totalTime / endpointMetrics.count;

        // Update response times
        this.requestTimes.push(duration);
        this.metrics.responseTimes.samples.push(duration);

        // Keep only last 1000 samples
        if (this.requestTimes.length > 1000) {
            this.requestTimes.shift();
        }
        if (this.metrics.responseTimes.samples.length > 1000) {
            this.metrics.responseTimes.samples.shift();
        }

        // Recalculate stats
        this.calculateResponseTimeStats();
    }

    /**
     * Calculate response time statistics
     */
    calculateResponseTimeStats() {
        if (this.requestTimes.length === 0) return;

        const sorted = [...this.requestTimes].sort((a, b) => a - b);

        this.metrics.responseTimes.min = sorted[0];
        this.metrics.responseTimes.max = sorted[sorted.length - 1];

        const sum = sorted.reduce((acc, val) => acc + val, 0);
        this.metrics.responseTimes.avg = sum / sorted.length;

        const p95Index = Math.floor(sorted.length * 0.95);
        const p99Index = Math.floor(sorted.length * 0.99);

        this.metrics.responseTimes.p95 = sorted[p95Index] || 0;
        this.metrics.responseTimes.p99 = sorted[p99Index] || 0;
    }

    /**
     * Record a database query
     */
    recordDatabaseQuery(duration, query = '') {
        this.metrics.database.queries++;

        const totalTime = this.metrics.database.avgQueryTime * (this.metrics.database.queries - 1) + duration;
        this.metrics.database.avgQueryTime = totalTime / this.metrics.database.queries;

        // Track slow queries (> 100ms)
        if (duration > 100) {
            this.metrics.database.slowQueries.push({
                query: query.substring(0, 100),
                duration,
                timestamp: new Date().toISOString()
            });

            // Keep only last 50 slow queries
            if (this.metrics.database.slowQueries.length > 50) {
                this.metrics.database.slowQueries.shift();
            }
        }
    }

    /**
     * Start monitoring system resources
     */
    startSystemMonitoring() {
        setInterval(() => {
            // Memory metrics
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;

            this.metrics.system.memory = {
                used: Math.round(usedMem / 1024 / 1024), // MB
                free: Math.round(freeMem / 1024 / 1024), // MB
                total: Math.round(totalMem / 1024 / 1024), // MB
                percentage: Math.round((usedMem / totalMem) * 100)
            };

            // CPU metrics (approximation based on load average)
            const loadAvg = os.loadavg();
            const cpuCount = os.cpus().length;
            this.metrics.system.cpu = {
                usage: Math.round((loadAvg[0] / cpuCount) * 100),
                loadAverage: {
                    '1min': loadAvg[0].toFixed(2),
                    '5min': loadAvg[1].toFixed(2),
                    '15min': loadAvg[2].toFixed(2)
                }
            };
        }, 5000); // Update every 5 seconds
    }

    /**
     * Get current metrics snapshot
     */
    getMetrics() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);

        return {
            uptime: {
                seconds: uptime,
                formatted: this.formatUptime(uptime)
            },
            requests: {
                ...this.metrics.requests,
                errorRate: this.metrics.requests.total > 0
                    ? ((this.metrics.requests.errors / this.metrics.requests.total) * 100).toFixed(2) + '%'
                    : '0%',
                successRate: this.metrics.requests.total > 0
                    ? ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) + '%'
                    : '0%',
                requestsPerSecond: uptime > 0
                    ? (this.metrics.requests.total / uptime).toFixed(2)
                    : '0'
            },
            responseTimes: {
                min: this.roundMetric(this.metrics.responseTimes.min),
                max: this.roundMetric(this.metrics.responseTimes.max),
                avg: this.roundMetric(this.metrics.responseTimes.avg),
                p95: this.roundMetric(this.metrics.responseTimes.p95),
                p99: this.roundMetric(this.metrics.responseTimes.p99),
                sampleCount: this.metrics.responseTimes.samples.length
            },
            database: {
                ...this.metrics.database,
                avgQueryTime: this.roundMetric(this.metrics.database.avgQueryTime)
            },
            system: this.metrics.system
        };
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        const metrics = this.getMetrics();

        const issues = [];

        // Check error rate
        const errorRate = parseFloat(metrics.requests.errorRate);
        if (errorRate > 10) {
            issues.push({ level: 'critical', message: `High error rate: ${metrics.requests.errorRate}` });
        } else if (errorRate > 5) {
            issues.push({ level: 'warning', message: `Elevated error rate: ${metrics.requests.errorRate}` });
        }

        // Check response times
        if (metrics.responseTimes.p99 > 5000) {
            issues.push({ level: 'critical', message: `High P99 latency: ${metrics.responseTimes.p99}ms` });
        } else if (metrics.responseTimes.p95 > 2000) {
            issues.push({ level: 'warning', message: `High P95 latency: ${metrics.responseTimes.p95}ms` });
        }

        // Check memory usage
        if (this.metrics.system.memory.percentage > 90) {
            issues.push({ level: 'critical', message: `High memory usage: ${this.metrics.system.memory.percentage}%` });
        } else if (this.metrics.system.memory.percentage > 75) {
            issues.push({ level: 'warning', message: `Elevated memory usage: ${this.metrics.system.memory.percentage}%` });
        }

        // Check CPU usage
        if (this.metrics.system.cpu.usage > 90) {
            issues.push({ level: 'critical', message: `High CPU usage: ${this.metrics.system.cpu.usage}%` });
        } else if (this.metrics.system.cpu.usage > 70) {
            issues.push({ level: 'warning', message: `Elevated CPU usage: ${this.metrics.system.cpu.usage}%` });
        }

        return {
            status: issues.length === 0 ? 'healthy' : (issues.some(i => i.level === 'critical') ? 'critical' : 'warning'),
            issues,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Format uptime in human-readable format
     */
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }

    /**
     * Round metric to 2 decimal places
     */
    roundMetric(value) {
        if (!isFinite(value)) return 0;
        return Math.round(value * 100) / 100;
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.requests.total = 0;
        this.metrics.requests.success = 0;
        this.metrics.requests.errors = 0;
        this.metrics.requests.byEndpoint = {};
        this.requestTimes = [];
        this.metrics.responseTimes.samples = [];
        this.metrics.database.queries = 0;
        this.metrics.database.avgQueryTime = 0;
        this.metrics.database.slowQueries = [];
        this.startTime = Date.now();
    }
}

// Singleton instance
let monitor = null;

/**
 * Get or create monitor instance
 */
function getMonitor() {
    if (!monitor) {
        monitor = new PerformanceMonitor();
    }
    return monitor;
}

module.exports = {
    PerformanceMonitor,
    getMonitor
};

// Example usage
if (require.main === module) {
    const monitor = getMonitor();

    // Simulate some requests
    for (let i = 0; i < 100; i++) {
        const duration = Math.random() * 500 + 50;
        const success = Math.random() > 0.1; // 90% success rate
        monitor.recordRequest('/api/test', duration, success);
    }

    console.log('=== Performance Metrics ===');
    console.log(JSON.stringify(monitor.getMetrics(), null, 2));

    console.log('\n=== Health Status ===');
    console.log(JSON.stringify(monitor.getHealthStatus(), null, 2));
}
