/**
 * Created by hoichi on 02.11.2016.
 */
export function dateFormatter(locale = 'en_US', options) {
    // $TODO: something more customizable? moments.js? or?
    let dtf = new Intl.DateTimeFormat(locale, options);
    return dtf.format.bind(dtf);
}

export function firstParagraphOfHtml(html) {
    if (typeof html !== 'string') { html =''; }

    let paragraphs = /<p>(.*?)<\/p>/.exec(html);
    if(!paragraphs) { throw Error(`Not a single paragraph found, are you kidding me?`); }

    return paragraphs[1].replace(/<(.|\n)*?>/g, '');
}

export function plainTextToHtml(s) {
    let paragraphs = s.split(/(?:\s*\n){2,}/g);
    if (!paragraphs.length || !paragraphs[0]) {
        throw new Error(`You could’t even pass ONE paragraph? Wow. Just... wow.`);
    }

    return  paragraphs
        .map(p => `<p>${p.replace(/\s*\n/g, '<br>\n')}</p>`)
        .join(`\n\n`)
        ;
}
