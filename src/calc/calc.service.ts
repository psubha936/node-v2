import { Injectable, BadRequestException } from '@nestjs/common';
import { CalcDto } from './calc.dto';

@Injectable()
export class CalcService {
  calculateExpression(calcBody: CalcDto): number {
    const expression = calcBody.expression;

    if (!this.isValidExpression(expression)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid expression provided',
        error: 'Bad Request',
      });
    }

    try {
      const result = this.evaluateExpression(expression);
      return result;
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid expression provided',
        error: 'Bad Request',
      });
    }
  }

  private isValidExpression(expression: string): boolean {
    const validCharacters = /^[0-9+\-*/\s]+$/;
    if (!validCharacters.test(expression)) {
      return false;
    }

    const invalidSequences = /([+\-*/]{2,})|([+\-*/]$)|(^[+\-*/])/;
    if (invalidSequences.test(expression)) {
      return false;
    }

    return true;
  }

  private evaluateExpression(expression: string): number {
    const outputQueue: string[] = [];
    const operatorStack: string[] = [];
    const operators = {
      '+': { precedence: 1, associativity: 'Left' },
      '-': { precedence: 1, associativity: 'Left' },
      '*': { precedence: 2, associativity: 'Left' },
      '/': { precedence: 2, associativity: 'Left' },
    };

    const tokens = expression.match(/(\d+|\+|\-|\*|\/)/g) || [];

    for (const token of tokens) {
      if (/\d/.test(token)) {
        outputQueue.push(token);
      } else if (token in operators) {
        const o1 = token;
        let o2 = operatorStack[operatorStack.length - 1];

        while (
          o2 in operators &&
          ((operators[o1].associativity === 'Left' &&
            operators[o1].precedence <= operators[o2].precedence) ||
            (operators[o1].associativity === 'Right' &&
              operators[o1].precedence < operators[o2].precedence))
        ) {
          outputQueue.push(operatorStack.pop()!);
          o2 = operatorStack[operatorStack.length - 1];
        }

        operatorStack.push(o1);
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop()!);
    }

    const resultStack: number[] = [];

    for (const token of outputQueue) {
      if (/\d/.test(token)) {
        resultStack.push(parseFloat(token));
      } else if (token in operators) {
        const b = resultStack.pop()!;
        const a = resultStack.pop()!;
        switch (token) {
          case '+':
            resultStack.push(a + b);
            break;
          case '-':
            resultStack.push(a - b);
            break;
          case '*':
            resultStack.push(a * b);
            break;
          case '/':
            resultStack.push(a / b);
            break;
        }
      }
    }

    return resultStack[0];
  }
}
