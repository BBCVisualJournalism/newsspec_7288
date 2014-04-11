define(['lib/news_special/bootstrap'], function (news) {

    var View = function (elm, vocab) {
        this.elm = news.$(elm);
        this.vocab = vocab;
        this.setupHtml();
        this.setupPubsubs();
        this.setupEvents();
        this.updateProgress(0, 0);
        news.pubsub.emit('quiz:requestFirstQuestion');
    };

    View.prototype = {
        elm: null,
        setupHtml: function () {
            this.elm.append('<div class="quiz--progress-bar"><div class="quiz--progress-indicator"><div></div>');
            this.elm.append(
                '<div class="quiz--question-section">' +
                    '<div class="quiz--question"></div>' +
                    '<ul class="quiz--list-of-options"></ul>' +
                    '<div class="quiz--supporting-text--generic"></div>' +
                    '<div class="quiz--supporting-text"></div>' +
                    '<button class="quiz--next-button">' + this.vocab.next + '</button>' +
                '</div>');
            this.elm.append(
                '<div class="quiz--result-section">' +
                    '<div class="quiz--overview"></div>' +
                    '<div class="quiz--score"></div>' +
                    '<div class="quiz--summary"></div>' +
                    '<button class="quiz--restart-button">' + this.vocab.restart + '</button>' +
                    '<div class="quiz--share-tools"></div>' +
                    '<div class="quiz--extra-text"></div>' +
                '</div>'
            );
        },
        setupPubsubs: function () { // would prefer this to call methods on class directly, but pubsub lib binds callbacks to jquery for chaining
            var View = this;
            news.pubsub.on('quiz:showQuestion', function (question, options, supportingText, feedback) {
                View.renderQuestion(question, options, supportingText, feedback);
            });
            news.pubsub.on('quiz:end', function (score, outOf, feedback) {
                View.renderResult(score, outOf, feedback);
            });
            news.pubsub.on('quiz:progress', function (currentQuestion, totalNumberOfQuestions) {
                View.updateProgress(currentQuestion, totalNumberOfQuestions);
            });
        },
        setupEvents: function () {
            var View = this;
            this.elm.find('.quiz--list-of-options')[0].addEventListener('click', function (e) {
                var targetElm = e.target || e.srcElement;
                if (targetElm.nodeName === 'INPUT') {
                    var feedback = news.$(targetElm).find('.quiz--checkbox').attr('data-feedback') || news.$(targetElm).attr('data-feedback');
                    View.showSupportingText(feedback);
                    View.disableOtherOptions();
                }
            }, false);
            this.elm.find('.quiz--next-button')[0].addEventListener('click', function () {
                View.nextButtonClick();
            }, false);
            this.elm.find('.quiz--restart-button')[0].addEventListener('click', function () {
                View.resetButtonClick();
            }, false);
        },
        renderQuestion: function (question, options, supportingText, feedback) {
            this.elm.addClass('quiz__mode-question');
            this.elm.removeClass('quiz__mode-result');
            this.elm.find('.quiz--question').html(question);
            this.elm.find('.quiz--list-of-options').html('');
            var View = this,
                optionFeedbackIndex = 0;
            news.$.each(options, function (key) {
                var optionId       = 'quiz--option-' + (key.split(' ').join('')),
                    optionFeedback = feedback[optionFeedbackIndex],
                    li             = '<li class="quiz--option">' +
                                    '<label for="' + optionId + '" class="quiz--label">' +
                                        '<input type="radio" name="quiz--option" id="' + optionId + '" value="' + key + '" class="quiz--checkbox" data-feedback="' + optionFeedback + '" /> ' +
                                        key +
                                    '</label>' +
                                '</li>';
                View.elm.find('.quiz--list-of-options').append(li);
                optionFeedbackIndex++;
            });

            this.elm.find('.quiz--supporting-text--generic').html(supportingText);
            this.elm.find('.quiz--supporting-text').hide();
            this.elm.find('.quiz--next-button').hide();
        },
        renderResult: function (score, outOf, feedback) {
            this.elm.addClass('quiz__mode-result');
            this.elm.removeClass('quiz__mode-question');
            this.elm.find('.quiz--overview').html(feedback.overview);
            this.elm.find('.quiz--score').html(this.vocab.youRated + ' ' + score + ' ' + this.vocab.outOf  + ' ' + outOf);
            this.elm.find('.quiz--summary').html(feedback.summary);
            this.elm.find('.quiz--extra-text').html(feedback.extraText);
            //news.pubsub.emit('shareTools:message', [this.vocab.iRated + ' ' + score + ' ' + this.vocab.outOf + ' ' + outOf + ' ' + this.vocab.onTheQuiz]);
            news.pubsub.emit('shareTools:message', [this.vocab.shareMessage ]);//+ ' ' + this.vocab.shareUrl]);
            this.updateProgress(1, 0);
        },
        showSupportingText: function (specificFeedback) {
            var supportingText = '<p>' + specificFeedback + '</p><p>' + this.elm.find('.quiz--supporting-text--generic').html() + '</p>';
            this.elm.find('.quiz--supporting-text').show().html(supportingText);
            this.elm.find('.quiz--next-button').show();
        },
        disableOtherOptions: function () {
            var radioButton;
            news.$('.quiz--checkbox').each(function () {
                radioButton = news.$(this);
                if (!radioButton.is(':checked')) {
                    radioButton.attr('disabled', 'disabled');
                    radioButton.parent().parent().addClass('quiz--option--disabled');
                }
            });
        },
        resetButtonClick: function () {
            news.pubsub.emit('quiz:reset');
            news.pubsub.emit('shareTools:reset');
        },
        nextButtonClick: function () {
            news.pubsub.emit('quiz:answerQuestion', [this.elm.find('.quiz--checkbox:checked').val()]);
        },
        updateProgress: function (currentQuestion, totalNumberOfQuestions) {
            var progress = Math.floor((currentQuestion / (totalNumberOfQuestions + 1)) * 100);
            if (isNaN(progress)) {
                progress = 0;
            }
            this.elm.find('.quiz--progress-indicator').css('width', progress + '%');
            this.elm.find('.quiz--question-section')[0].className = ('quiz--question-section quiz--question-section__' + currentQuestion);
        }
    };

    return View;

});