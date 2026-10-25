const rules=[
 {category:'Royalty & Payments',terms:['royalty','payment','payout','paid','bank','earning','earnings','money','amount','refund']},
 {category:'ISBN & Metadata Issues',terms:['isbn','metadata','author bio','description','title correction','wrong book','duplicate']},
 {category:'Printing & Quality',terms:['print quality','printing','misprint','binding','blurry','pages','damaged','defect','reprint']},
 {category:'Distribution & Availability',terms:['amazon','flipkart','unavailable','listing','distribution','stock','available','resync','re-sync']},
 {category:'Book Status & Production Updates',terms:['production','typesetting','cover design','proofreading','manuscript','publication date','book status','delay','approval']}
];
export function classifyByRules(text) {
 const normalized=text.toLowerCase(); const matches=rules.map(r=>({...r,score:r.terms.reduce((n,t)=>n+(normalized.includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score);
 let category=matches[0]?.score>0?matches[0].category:'General Inquiry';
 let priority='Low';
 if(/security breach|credible threat|immediate safety risk/i.test(text)) priority='Critical';
 else if(/isbn.{0,25}(wrong|incorrect|duplicate)|wrong.{0,15}isbn|serious defect|fraud|urgent.{0,15}(royalty|payment)|not received.{0,30}(royalt|payment)|overdue|6 months|six months|misprint|binding defect|wrong isbn|incorrect isbn|duplicate isbn|damaged copies|quality issue|haven.t received/i.test(text)) priority='High';
 else if(/royalt|payment|printing|unavailable|delay|not updated|not listed/i.test(normalized)) priority='Medium';
 return {category,priority,confidence:matches[0]?.score?Math.min(.92,.55+matches[0].score*.1):.45,source:'rules'};
}
