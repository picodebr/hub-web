/**
 * EventEmitter - Classe Base para Emissão de Eventos.
 * 
 * Provê uma infraestrutura genérica e "typesafe" (tipagem segura) para que 
 * os serviços da aplicação possam emitir e escutar eventos customizados. 
 * É fundamental para a comunicação entre a lógica de serviços e os hooks de UI.
 */

type Listener<T = any> = (data: T) => void;

export class EventEmitter<Events extends Record<string, any>> {
    private listeners: Map<keyof Events, Listener[]> = new Map();

    /**
     * Subscribe to an event
     * @param event Event name
     * @param listener Callback function
     */
    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }

    /**
     * Unsubscribe from an event
     * @param event Event name
     * @param listener Callback function to remove
     */
    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(event, eventListeners.filter(l => l !== listener));
        }
    }

    /**
     * Emit an event to all subscribers
     * @param event Event name
     * @param data Data to pass to listeners
     */
    protected emit<K extends keyof Events>(event: K, data: Events[K]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener(data);
                } catch (e) {
                    console.error(`[EventEmitter] Error in listener for event '${String(event)}':`, e);
                }
            });
        }
    }

    /**
     * Remove all listeners (useful for cleanup)
     */
    removeAllListeners(): void {
        this.listeners.clear();
    }
}
