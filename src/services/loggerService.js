// Logger service with different log levels
angular.module('loggerModule', [])
  .factory('LoggerService', function() {
    let logs = [];
    let logLevel = 'info'; // debug, info, warn, error

    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    function shouldLog(level) {
      return levels[level] >= levels[logLevel];
    }

    function createLogEntry(level, message, data) {
      return {
        timestamp: new Date(),
        level: level,
        message: message,
        data: data || null
      };
    }

    return {
      setLogLevel: function(level) {
        if (levels.hasOwnProperty(level)) {
          logLevel = level;
        }
      },

      getLogLevel: function() {
        return logLevel;
      },

      debug: function(message, data) {
        if (shouldLog('debug')) {
          const entry = createLogEntry('debug', message, data);
          logs.push(entry);
          console.debug('[DEBUG]', message, data);
          return entry;
        }
      },

      info: function(message, data) {
        if (shouldLog('info')) {
          const entry = createLogEntry('info', message, data);
          logs.push(entry);
          console.info('[INFO]', message, data);
          return entry;
        }
      },

      warn: function(message, data) {
        if (shouldLog('warn')) {
          const entry = createLogEntry('warn', message, data);
          logs.push(entry);
          console.warn('[WARN]', message, data);
          return entry;
        }
      },

      error: function(message, data) {
        if (shouldLog('error')) {
          const entry = createLogEntry('error', message, data);
          logs.push(entry);
          console.error('[ERROR]', message, data);
          return entry;
        }
      },

      getLogs: function(level) {
        if (level) {
          return logs.filter(log => log.level === level);
        }
        return angular.copy(logs);
      },

      clearLogs: function() {
        logs = [];
      }
    };
  });
