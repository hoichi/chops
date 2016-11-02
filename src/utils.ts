/**
 * Created by hoichi on 02.11.2016.
 */
export function dateFormatter(locale = 'en_US', options) {
    // $TODO: something more customizable? moments.js? or?
    let dtf = new Intl.DateTimeFormat(locale, options);
    return dtf.format.bind(dtf);
}
