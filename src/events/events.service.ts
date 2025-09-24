import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter, map } from 'rxjs';

interface SseEvent {
    userId: number;
    eventType: string;
    data: unknown;
}

@Injectable()
export class EventsService {
    private eventSubject = new Subject<SseEvent>();

    /**
     * Subscribe to user events
     */
    subscribeToUser(userId: number): Observable<MessageEvent> {
        return new Observable<MessageEvent>(observer => {
            // Send initial connection event
            observer.next({
                type: 'open',
                data: JSON.stringify({ status: 'connected' }),
            } as MessageEvent);

            // Subscribe to events for this user
            const subscription = this.eventSubject
                .pipe(
                    filter(event => event.userId === userId),
                    map(
                        event =>
                            ({
                                type: event.eventType,
                                data: JSON.stringify(event.data),
                            }) as MessageEvent,
                    ),
                )
                .subscribe(observer);

            return () => subscription.unsubscribe();
        });
    }

    /**
     * Send event to user
     */
    sendToUser(userId: number, eventType: string, data: unknown): void {
        this.eventSubject.next({
            userId,
            eventType,
            data,
        });
    }
}
