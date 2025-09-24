import { Controller, Sse, UseGuards, Req, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventsService } from './events.service';

interface AuthenticatedRequest extends Request {
    user: { sub: number; email: string };
}

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Sse()
    @UseGuards(JwtAuthGuard)
    subscribe(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
        const userId = req.user.sub;
        return this.eventsService.subscribeToUser(userId);
    }
}
