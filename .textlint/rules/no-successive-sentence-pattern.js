// 同じ段落で、続く 2 文の文末（句点の前の 4 文字）か、書き出しの主語（「〜は」）が同じなら知らせる
module.exports = function (context) {
  const { Syntax, RuleError, report, getSource } = context;
  return {
    [Syntax.Paragraph](node) {
      const text = getSource(node);
      const sentences = [];
      const re = /[^。！？\n]+[。！？]?[^\S\n]*(?:\p{Extended_Pictographic}️?)?/gu;
      let m;
      while ((m = re.exec(text))) { const raw = m[0].trim(); if (raw && !/^!\[/.test(raw)) sentences.push({ raw, index: m.index }); }
      const end = s => s.replace(/[\s。！？!?]+$/u, "").replace(/\s*\p{Extended_Pictographic}️?$/u, "").slice(-4);
      const subj = s => (s.match(/^([^、。]{1,20}?)は[、 ]/) || [])[1];
      for (let i = 1; i < sentences.length; i++) {
        const a = sentences[i - 1].raw, b = sentences[i].raw;
        if (end(a).length === 4 && end(a) === end(b)) report(node, new RuleError(`文末「${end(b)}」が前の文と同じです`, { index: sentences[i].index }));
        if (subj(a) && subj(a) === subj(b)) report(node, new RuleError(`主語「${subj(b)}は」が前の文と同じです`, { index: sentences[i].index }));
      }
    }
  };
};
