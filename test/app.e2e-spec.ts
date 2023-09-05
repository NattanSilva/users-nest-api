import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { createFirstUserData } from './__mocks__';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/users', () => {
    it('POST - create a user successfuly', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createFirstUserData);

      console.log(response.body);

      expect(response.status).toEqual(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
