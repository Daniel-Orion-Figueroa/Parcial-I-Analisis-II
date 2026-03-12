/**
 * Utilidad para limpiar todo el almacenamiento local del frontend
 * Esto elimina todos los datos mock y caché para forzar el uso de API real
 */

export class ClearStorageUtil {
  
  /**
   * Limpia completamente localStorage y sessionStorage
   */
  static clearAll(): void {
    if (typeof window !== 'undefined') {
      console.log('🧹 Iniciando limpieza completa de datos...');
      
      // Limpiar claves específicas del proyecto
      const keysToRemove = [
        'mockUsers',
        'mockBooks', 
        'mockLoans',
        'mockReservations',
        'token',
        'user',
        'currentUser',
        'authToken',
        'library_users',
        'library_books',
        'library_loans',
        'library_reservations',
        'registeredUsers',
        'defaultUsers',
        'angularLocalstorage',
        'ngStorage',
        '__auth',
        '__user'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Eliminado: ${key}`);
      });
      
      // Limpiar todo localStorage por seguridad
      localStorage.clear();
      console.log('🧹 localStorage completamente limpiado');
      
      // Limpiar sessionStorage también
      sessionStorage.clear();
      console.log('🧹 sessionStorage completamente limpiado');
      
      // Limpiar cookies si existen
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/"); 
      });
      console.log('🧹 Cookies limpiadas');
      
      // Forzar recarga de página para limpiar variables en memoria
      console.log('🔄 Recargando página para limpiar memoria...');
    }
  }
  
  /**
   * Limpia y recarga la página completamente
   */
  static clearAndReload(): void {
    this.clearAll();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  
  /**
   * Verifica qué claves existen en localStorage
   */
  static checkStorage(): void {
    if (typeof window !== 'undefined') {
      console.log('📋 Claves en localStorage:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          console.log(`  ${key}: ${value?.substring(0, 50)}...`);
        }
      }
    }
  }
  
  /**
   * Limpia solo datos mock pero mantiene sesión
   */
  static clearMockData(): void {
    if (typeof window !== 'undefined') {
      const mockKeys = [
        'mockUsers',
        'mockBooks', 
        'mockLoans',
        'mockReservations',
        'library_users',
        'library_books',
        'library_loans',
        'library_reservations'
      ];
      
      mockKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Eliminado mock: ${key}`);
      });
    }
  }
}
