import { Injectable } from '@nestjs/common';
import { getScale, APP_NAME } from '@bingens/core'; // ¡Importación mágica!

@Injectable()
export class AppService {
  getHello(): string {
    const scale = getScale('C'); // Usamos la función del core
    return `Welcome to ${APP_NAME}. Scale: ${scale.join(' - ')}`;
  }
}