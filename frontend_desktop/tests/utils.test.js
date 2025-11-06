/*
 * utils.test.js
 * Nosso primeiro arquivo de teste unitário.
 */

// Importa a função que queremos testar (formato CommonJS)
import { soma } from '../utils.js';

// "describe" agrupa um conjunto de testes relacionados (Test Suite)
describe('Testes para utils.js (Funções Auxiliares)', () => {

  // "test" define um caso de teste individual
  test('deve somar 2 + 2 e retornar 4', () => {
    
    // "expect" é o que esperamos que aconteça
    // ".toBe" é o "matcher" (o resultado esperado)
    expect(soma(2, 2)).toBe(4);
  });

  test('deve somar números negativos corretamente', () => {
    expect(soma(-1, -5)).toBe(-6);
  });

  test('deve somar um número positivo e um negativo', () => {
    expect(soma(10, -2)).toBe(8);
  });

});