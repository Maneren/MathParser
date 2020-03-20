/* Made by Maneren */
/* global $, Parser */

window.onload = () => {
  const parser = new Parser({
    precision: 6,
    errorHandler: error => $('#out')
      .html(error)
  });
  $('#generate')
    .click(() => {
      const eq = $('#eq')
        .val();
      const result = parser.parse(eq);
      if (result) {
        $('#out')
          .html(result.toString())
        ;
      }
    });
};
