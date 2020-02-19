/* eslint-disable */
import 'preact-jsx-chai';
import { expect } from 'chai';

import {
  transformRecomendations,
  objectToUrlParams,
  in2cm,
  ft2in,
  cmToFtIn,
  getHeightCm,
  send,
} from '../src/helpers/utils';

describe('utils', () => {
  describe('transformRecomendations', () => {
    it('should transform object correctly', () => {
      const recomendations = {
        normal: {
          size: 'M',
          accuracy: 0.6933732682744242,
          body_part: 'chest',
        },
      };

      const transformedRecomendations = transformRecomendations(recomendations);

      expect(transformedRecomendations).to.eql({ normal: 'M' });
    });
  });

  describe('objectToUrlParams', () => {
    it('should transform object to query params string', () => {
      const paramsObject = {
        param1: 1,
        param2: '2',
      };

      const queryString = objectToUrlParams(paramsObject);

      expect(queryString).to.be.equal('param1=1&param2=2');
    });
  });

  describe('in2cm', () => {
    it('should convert inches to centimeters', () => {
      expect(in2cm(12)).to.equal(30.48);
      expect(in2cm(20)).to.equal(50.8);
      expect(in2cm(154)).to.equal(391.16);
    });
  });

  describe('ft2in', () => {
    it('should convert feets to inches', () => {
      expect(ft2in(1)).to.equal(12);
      expect(ft2in(3)).to.equal(36);
      expect(ft2in(15)).to.equal(180);
    });
  });

  describe('cmToFtIn', () => {
    it('should convert centimeters to feets and inches', () => {
      expect(cmToFtIn(150)).to.eqls({ ft: 4, in: 11 });
      expect(cmToFtIn(220)).to.eqls({ ft: 7, in: 3 });
    });
  });

  describe('getHeightCm', () => {
    it('should convert feets and inches to centimeters', () => {
      expect(getHeightCm(4, 11).toFixed()).to.equal('150');
      expect(getHeightCm(7, 0).toFixed()).to.equal('213');
    });
  });

  describe('send', () => {

    it('should send message to parent window', (done) => {
      window.parent = window;

      const handler = (e) => {
        const c = e.data;
        expect(c.command).to.equal('saia-pf-widget.test');
        expect(c.data).to.equal('test data');
        window.removeEventListener('message', handler);
        return done();
      };

      window.addEventListener('message', handler);

      send('test', 'test data');
    });

  });
});
