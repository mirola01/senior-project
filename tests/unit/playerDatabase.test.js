import fs from 'fs';
import path from 'path';
import { new_player, delete_player } from '../../dist/scripts/database';
import faunadb, { query as q } from 'faunadb';
import * as Auth from '../../dist/scripts/auth';


jest.mock('faunadb');
jest.mock('../../dist/scripts/auth');
const fauna_key = 'fnAFOF01yxAASegxSMrTHFl72bpUPsUmoW9aNNO7';

describe('database.js', () => {
  const mockClient = {
    query: jest.fn()
  };
  const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFwdDJJZlM5SllPZ1pvdVRHOUdRTCJ9.eyJodHRwczovL2RiLmZhdW5hLmNvbS9yb2xlcyI6W10sImlzcyI6Imh0dHBzOi8vZGV2LW44NGd4M3VhbmliNm9qcGYudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE2MDE4NjA2NTA5MTk4NDMxNDMzIiwiYXVkIjpbImh0dHBzOi8vZGIuZmF1bmEuY29tL2RiL3l3aGZhM3lqNnl5cjEiLCJodHRwczovL2Rldi1uODRneDN1YW5pYjZvanBmLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MDE4ODYwMjIsImV4cCI6MTcwMTk3MjQyMiwiYXpwIjoiWGU2dDA3RVRnUUJrU3ZpcGJTQ0NGUmJ4YUJtZURNRUMiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.OZrOcRBfff_PkVFvJCg1ndIm1yV8JPZwb-aOaoAmiwCBgN_kgO05Z2feoZGWJ9xrcLhv8Nja_URpPikHxPO7D9ULwhvUzqlkFKJEBSDj4irndagpSFHAQ_2vhKgh_IXEBjEsZPdQLK1fY_CSrvH7WdzjbbCQlmuaGSatgowkiJLU7xJTJOj0jRg58iERO0-kXCVtHKd8CYZcOmFHEmxZXr5nWWueo4T6nkJ5lxonj7FL50LKzOgTdqOcStjEoZ58dDjVpw7iPX3UGoMx-PHIIp9TMzY0Fm9PZB7Pe_JDYek6QD1thUwHuf2QnIVnrdlez0jL15djpIPtKy6PaUurdw';
  const decodedJWT = { sub: 'google-oauth2|116018606509198431433' };

  beforeAll(() => {
    Auth.getFaunaKey.mockReturnValue(fauna_key);
    faunadb.Client.mockImplementation(() => mockClient);
    global.localStorage = {
      getItem: jest.fn().mockReturnValue(accessToken)
    };
    global.jwt_decode = jest.fn().mockReturnValue(decodedJWT);
    
    // Mocking window and its properties
    global.window = {
      location: {
        reload: jest.fn()
      }
    };
        // Mock for File constructor
        global.File = jest.fn().mockImplementation((content, fileName, options) => ({
          content,
          fileName,
          type: options.type,
        }));
    
        // Mock for document.querySelector to return a mock file input
        global.document = {
          querySelector: jest.fn().mockImplementation(selector => {
            if (selector === '#playerImage') {
              return {
                files: [
                  new File([fs.readFileSync(path.join(__dirname, '../../dist/images/test-img.jpg'))], 'test-img.jpg', {
                    type: 'image/jpeg',
                  }),
                ],
              };
            }
            return null;
          }),
        };
        global.FileReader = jest.fn().mockImplementation(() => {
          return {
              readAsDataURL: jest.fn(),
              onloadend: jest.fn(),
              result: 'mock_base64_encoded_string'
          };
      });
  });

  describe('new_player', () => {
    it('should create a new player record in FaunaDB without an image', async () => {
      const playerDataWithoutImage = {
        name: "Hector",
        age: 33,
        position: "Defender",
        jersey: 10
        // Note: No image property here
      };
    
      await new_player();
    
      expect(faunadb.Client).toHaveBeenCalledWith({
        secret: fauna_key,
        domain: 'db.us.fauna.com',
        port: 443,
        scheme: 'https'
      });
      expect(faunaClientMock.query).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(expect.any(Object), {
        data: {
          name: playerDataWithoutImage.name,
          age: playerDataWithoutImage.age,
          position: playerDataWithoutImage.position,
          jersey: playerDataWithoutImage.jersey,
          image: "",
          owner: expect.any(String)
        }
      });
      expect(window.location.reload).toHaveBeenCalled();
    });
    
    it('should create a new player record in FaunaDB', async () => {
      // Player data
      const playerData = {
        name: "Hector",
        age: 33,
        position: "Defender",
        jersey: 10,
        image: "../../dist/images/test-img.jpg"
      };

      await new_player();

      expect(faunadb.Client).toHaveBeenCalledWith({
        secret: fauna_key,
        domain: 'db.us.fauna.com',
        port: 443,
        scheme: 'https'
      });
      expect(mockClient.query).toHaveBeenCalledWith(
        q.Create(q.Collection("Players"), {
          data: {
            ...playerData,
            owner: decodedJWT
          }
        })
      );
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('delete_player', () => {
    it('should delete a player record from FaunaDB', async () => {
      const playerId = 'abc123';

      await delete_player(playerId);

      expect(faunadb.Client).toHaveBeenCalledWith({
        secret: fauna_key,
        domain: 'db.us.fauna.com',
        port: 443,
        scheme: 'https'
      });
      expect(mockClient.query).toHaveBeenCalledWith(
        q.Delete(q.Ref(q.Collection("Players"), playerId))
      );
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});

