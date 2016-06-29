"use strict"
let async = require('async');
module.exports = function(WwwCocts) {
  WwwCocts.resolveRelatedModels = function() {
    if (!this.WwwCoctsq) {
      var reg = this.registry;
      this.WwwCoctsq = reg.getModel('WwwCoctsq');
    }
  };
  WwwCocts.begin = function(next) {
    WwwCocts.resolveRelatedModels();
    let WwwCoctsq = WwwCocts.WwwCoctsq;
    WwwCocts.count(function(err, count) {
      let skip = 0;
      let limit = 1000;
      async.whilst(
        function() { return skip < count; },
        function(callback) {
          console.log(`skip:${skip};limit${limit}`)
          WwwCocts.find({
            skip: skip,
            limit: limit
          }).then(function(WwwCoctsList) {
            let qoList = [];
            for(let wwwCocts of WwwCoctsList){
              if (wwwCocts.submitContent) {
                let submitContent = eval(wwwCocts.submitContent) || [];
                if (!submitContent || submitContent.length == 0) {
                  continue
                }
                for (let submitQuiz of  submitContent) {
                  let _sQuiz = {};
                  try {
                    if(typeof submitQuiz=='string'){
                      _sQuiz = JSON.parse(submitQuiz);
                    }
                  } catch (e) {
                    console.log(e)
                    console.log(typeof submitQuiz)
                  }
                  let quizId = _sQuiz.quizId;
                  let userAnswer = _sQuiz.userAnswer;
                  if (!quizId || !userAnswer) {
                    continue
                  }
                  qoList.push({
                    id: 0,
                    unitName: wwwCocts.unitName,
                    itemName: wwwCocts.itemName,
                    testId: wwwCocts.testId,
                    testName: wwwCocts.testName,
                    testPaperId: wwwCocts.testPaperId,
                    submitId: wwwCocts.submitId,
                    userId: wwwCocts.userId,
                    quizId: quizId,
                    optionId: userAnswer
                  })
                }
              }
            }
            WwwCoctsq.create(qoList, function(err) {
              skip = skip + limit;

              callback(null);
            })
          }).catch(function(err) {
            if (err) {
              callback(err);
            }
          })
        },
        function(err, n) {
          next(err, 'success');
        }
      );
    })
  };
  WwwCocts.remoteMethod('begin', {
    accepts: [],
    returns: {arg: 'state', type: 'string'},
    http: {path: '/begin', verb: 'get'}
  });
};
