import ohm             from 'ohm-js';

export const grammar = ohm.grammar(`
  NumberRange {
    ListOfExp
      = ListOf<Exp, ",">
    
    Exp
      = range
      | int
      
    range
      = int "-" int
      
    int
      = digit+
  }
`);

export const semantics = grammar.createSemantics()
  .addOperation(
    'interpret',
    {
      NonemptyListOf(head, _, tail) {
        return [head.interpret(), ...tail.interpret()];
      },
      EmptyListOf() {
        return [];
      },
      Exp(expression) {
        return expression.interpret();
      },
      range(from, _, to) {
        return { from: from.interpret(), to: to.interpret(), };
      },
      int(_) {
        return parseInt(this.sourceString, 10);
      },
    }
  );
