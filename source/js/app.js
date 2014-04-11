define(
    ['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller', 'quiz_model', 'quiz_view'],
    function (news, shareTools, QuizModel, QuizView) {

    return {
        init: function () {
            var myQuizModel = new QuizModel(window.quizData),
                myQuizView  = new QuizView('.quiz', window.vocab),
                storyPageUrl = window.vocab.shareUrl;

            this.setupShare(shareTools, storyPageUrl);
        },
        setupShare: function (shareTools, storyPageUrl) {
            var shared = false;
            news.pubsub.on('shareTools:message', function (message) {
                if (!shared) {
                    shareTools.init('.quiz--share-tools', storyPageUrl, {
                        header: window.vocab.shareHeader,
                        message: message
                    });
                    shared = true;
                }
            });
        }
    };

});