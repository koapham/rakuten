import web3 from './web3';

import SurveyFactory from './build/SurveyFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(SurveyFactory.interface),
    '0x4491B9e9dC8a1fad4ff5fB1eCD5DfeC9Eff21411'
    //Thu ropsten: '0x44a365379dd1ac1e05d5203e54c1e8cd7f9d9383'
);

export default instance;

// Khoa ropsten : '0x6d3edaa0ed4c5818f6316089571650b117dc002c'
// Localhost 8545 : '0xe7e9de570e69eaae33b7859ad5151ceac76af673'
// '0x01ba298162ddadd0bde6089b54e49b63cf0893de'
// '0x86c799c969445bc98e64645f5525fd0bb22084a4'
