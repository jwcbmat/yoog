import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Appointments (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtToken: string;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@yoog.com', password: 'password123' });

    jwtToken = loginRes.body.access_token;

    const patientRes = await request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ name: 'Johnathan Bruns', phone: '1234567890' });

    patientId = patientRes.body.id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create an appointment with initial status AGUARDANDO', async () => {
    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ patientId, description: 'Routine Checkup' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('AGUARDANDO');
  });

  it('should NOT allow invalid transitions (AGUARDANDO -> FINALIZADO)', async () => {
    const setup = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ patientId, description: 'Invalid State Test' });

    const appId = setup.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/appointments/${appId}/status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'FINALIZADO' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid transition');
  });

  it('should follow the full flow: AGUARDANDO -> EM_ATENDIMENTO -> FINALIZADO', async () => {
    const setup = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ patientId, description: 'Happy Path Flow' });

    const appId = setup.body.id;

    await request(app.getHttpServer())
      .patch(`/appointments/${appId}/status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'EM_ATENDIMENTO' })
      .expect(200);

    const finalRes = await request(app.getHttpServer())
      .patch(`/appointments/${appId}/status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'FINALIZADO' });

    expect(finalRes.status).toBe(200);
    expect(finalRes.body.status).toBe('FINALIZADO');
  });
});
