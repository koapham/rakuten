import web3 from './web3';
import Survey from './build/Survey.json';

export default (address) => {
    return new web3.eth.Contract(
        JSON.parse(Survey.interface),
        address
    );
};