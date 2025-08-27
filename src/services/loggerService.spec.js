describe('LoggerService', function() {
  let LoggerService;

  beforeEach(angular.mock.module('loggerModule'));

  beforeEach(angular.mock.inject(function(_LoggerService_) {
    LoggerService = _LoggerService_;
  }));

  beforeEach(function() {
    // Clear logs and reset log level before each test
    LoggerService.clearLogs();
    LoggerService.setLogLevel('info');
    
    // Spy on console methods
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  describe('log levels', function() {
    it('should set and get log level', function() {
      LoggerService.setLogLevel('debug');
      expect(LoggerService.getLogLevel()).toBe('debug');
      
      LoggerService.setLogLevel('error');
      expect(LoggerService.getLogLevel()).toBe('error');
    });

    it('should ignore invalid log levels', function() {
      LoggerService.setLogLevel('info');
      LoggerService.setLogLevel('invalid');
      expect(LoggerService.getLogLevel()).toBe('info');
    });
  });

  describe('debug logging', function() {
    it('should log debug messages when level is debug', function() {
      LoggerService.setLogLevel('debug');
      const entry = LoggerService.debug('Debug message', { test: true });
      
      expect(entry).toBeDefined();
      expect(entry.level).toBe('debug');
      expect(entry.message).toBe('Debug message');
      expect(entry.data).toEqual({ test: true });
      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'Debug message', { test: true });
    });

    it('should not log debug messages when level is info or higher', function() {
      LoggerService.setLogLevel('info');
      const entry = LoggerService.debug('Debug message');
      
      expect(entry).toBeUndefined();
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('info logging', function() {
    it('should log info messages when level is info or lower', function() {
      LoggerService.setLogLevel('info');
      const entry = LoggerService.info('Info message');
      
      expect(entry).toBeDefined();
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('Info message');
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'Info message', undefined);
    });

    it('should not log info messages when level is warn or higher', function() {
      LoggerService.setLogLevel('warn');
      const entry = LoggerService.info('Info message');
      
      expect(entry).toBeUndefined();
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe('warn logging', function() {
    it('should log warn messages when level is warn or lower', function() {
      LoggerService.setLogLevel('warn');
      const entry = LoggerService.warn('Warn message', { warning: true });
      
      expect(entry).toBeDefined();
      expect(entry.level).toBe('warn');
      expect(entry.message).toBe('Warn message');
      expect(entry.data).toEqual({ warning: true });
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'Warn message', { warning: true });
    });

    it('should not log warn messages when level is error', function() {
      LoggerService.setLogLevel('error');
      const entry = LoggerService.warn('Warn message');
      
      expect(entry).toBeUndefined();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('error logging', function() {
    it('should always log error messages', function() {
      LoggerService.setLogLevel('error');
      const entry = LoggerService.error('Error message', { error: true });
      
      expect(entry).toBeDefined();
      expect(entry.level).toBe('error');
      expect(entry.message).toBe('Error message');
      expect(entry.data).toEqual({ error: true });
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Error message', { error: true });
    });
  });

  describe('getLogs', function() {
    beforeEach(function() {
      LoggerService.setLogLevel('debug');
    });

    it('should return all logs when no level specified', function() {
      LoggerService.debug('Debug message');
      LoggerService.info('Info message');
      LoggerService.warn('Warn message');
      LoggerService.error('Error message');
      
      const logs = LoggerService.getLogs();
      expect(logs.length).toBe(4);
    });

    it('should return logs for specific level', function() {
      LoggerService.debug('Debug message');
      LoggerService.info('Info message 1');
      LoggerService.info('Info message 2');
      LoggerService.warn('Warn message');
      
      const infoLogs = LoggerService.getLogs('info');
      expect(infoLogs.length).toBe(2);
      expect(infoLogs[0].level).toBe('info');
      expect(infoLogs[1].level).toBe('info');
    });

    it('should return a copy of logs array', function() {
      LoggerService.info('Test message');
      const logs = LoggerService.getLogs();
      logs[0].message = 'Modified message';
      
      const logsAgain = LoggerService.getLogs();
      expect(logsAgain[0].message).toBe('Test message');
    });
  });

  describe('clearLogs', function() {
    it('should clear all logs', function() {
      LoggerService.setLogLevel('debug');
      LoggerService.debug('Debug message');
      LoggerService.info('Info message');
      LoggerService.warn('Warn message');
      LoggerService.error('Error message');
      
      expect(LoggerService.getLogs().length).toBe(4);
      
      LoggerService.clearLogs();
      
      expect(LoggerService.getLogs().length).toBe(0);
    });
  });

  describe('log entry structure', function() {
    it('should create log entries with correct structure', function() {
      LoggerService.setLogLevel('debug');
      const entry = LoggerService.info('Test message', { test: 'data' });
      
      expect(entry.timestamp).toBeDefined();
      expect(entry.timestamp instanceof Date).toBe(true);
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('Test message');
      expect(entry.data).toEqual({ test: 'data' });
    });

    it('should set data to null when not provided', function() {
      LoggerService.setLogLevel('debug');
      const entry = LoggerService.info('Test message');
      
      expect(entry.data).toBe(null);
    });
  });
});
