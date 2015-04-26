(function(){
    $(document).ready(function(){
        if (window.location.hash){
            $(window.location.hash).modal('show');
        }
    });

    $(window).on('load', function(){
        //If any text wraps to three lines then extend the height of the card.
        var cardHeight = 350;
        $('.card-asset .landing_mbox_text').each(function(){
            if ($(this).height() > 52){
                cardHeight = 350 + $(this).height() - 52;
            }
        });

        //Set a static height on the cards to override the css value if they should be a custom hei
        if (cardHeight > 330){
            $('.card-asset')
                .height(cardHeight)
                .children('.landing_link').height(cardHeight);
        }
    });
})();