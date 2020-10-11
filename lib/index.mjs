export class Progress {
  barLength = process.stdout.columns - 50;
  total;
  current;
  isEnd = false;

  constructor( total ) {
    this.total = total;
    this.current = 0;
  }

  update( num ) {
    this.current = Math.min( num, this.total );
    this.print( this.current / this.total );
  }

  print( currentProgress ) {
    if ( this.isEnd ) return;
    this.isEnd = currentProgress === 1;
    const filled_bar_length = (currentProgress * this.barLength) >> 0;
    const empty_bar_length = this.barLength - filled_bar_length;
    const empty = this.genBar( empty_bar_length, "-" );
    const filled = this.genBar( filled_bar_length, "=" );
    const percentage_progress = (currentProgress * 100).toFixed( 2 );
    process.stdout.clearLine( -1 );
    process.stdout.cursorTo( 0 );
    process.stdout.write(
      `progress: [${ filled }${ empty }] | ${ percentage_progress }%`
    );
    if ( this.isEnd ) {
      console.log();
    }
  }

  genBar( size, char, color = ( a ) => a ) {
    let str = "";
    for ( let i = 0; i < size; i++ ) {
      str += char;
    }
    return color( str );
  }
}



class config {
  total
  second
  name
  filledChar
  emptyChar
  filledColor
  emptyColor
}
