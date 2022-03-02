module.exports = {
    getTimestamps: (duration, current) => {
        const result = { to: current };
        switch(duration){
            case '6H':
                result.from = result.to - (60 * 60 * 6);
                break;
            case '2Y':
                result.from = result.to - (60 * 60 * 24 * 365 * 2);
                break;
        }
        return result;
    },

    getDateStrings: () => {
        const current = Date.now();
        const previous = current - (1000 * 60 * 60 * 24 * 31);
        const result = { 
            to: new Date(current).toISOString().replace(/T.+Z$/g, ''), 
            from: new Date(previous).toISOString().replace(/T.+Z$/g, '') 
        };
        return result;
    }
}