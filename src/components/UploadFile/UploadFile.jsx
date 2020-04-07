/* eslint class-methods-use-this: off */
import { h, Component } from 'preact';
import classNames from 'classnames';

import { getOrientation, fixOrientation } from '../../helpers/utils';

import './UploadFile.scss';

const environment = process.env.NODE_ENV;

/**
 * Upload file component
 */
export default class UploadFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'placeholder',
      file: null,
      value: null,
    };
  }

  componentDidMount() {
    const { value, change } = this.props;

    if (value) {
      this.setState({
        file: value,
        mode: 'preview',
      }, () => change(value));
    }
  }

  /**
   * Change file input handler
   *
   * @async
   */
  onChange = async (e) => {
    const file = e.target.files[0];
    await this.saveFile(file);
  }

  /**
   * Save file blob to the state
   *
   * @async
   * @param {Blob} file - image file
   */
  async saveFile(file) {
    const { change } = this.props;

    if (!file) {
      return;
    }

    const orientation = await getOrientation(file);
    const fileBase64 = await fixOrientation(file, orientation);

    this.setState({
      file: fileBase64,
      mode: 'preview',
    }, () => change(fileBase64));
  }

  /**
   * Disable dragOver and dragLeave events
   */
  disableDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * Handle drop image file event
   */
  dropImage = async (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    const { files } = dt;
    await this.saveFile(files[0]);
  }

  /**
   * Enter and space buttons press handler
   * Triggers file input
   */
  keyboardAccess = (e) => {
    if (e.which === 32 || e.which === 13) {
      e.preventDefault();
      e.target.click();
    }
  }

  render() {
    const {
      type,
      isValid,
      gender,
    } = this.props;

    const {
      value,
      mode,
      file,
    } = this.state;

    const fileText = (type === 'front') ? 'Front' : 'Side';

    const classes = classNames('upload-file',
      {
        'upload-file--invalid': !isValid,
      });

    return (
      <label
        onDragOver={this.disableDragEvents}
        onDragLeave={this.disableDragEvents}
        onDrop={this.dropImage}
        className={classes}
        htmlFor={type}
        tabIndex="0"
        onKeyPress={this.keyboardAccess}
        onKeyUp={this.keyboardAccess}
      >
        <input type="file" name={type} id={type} onChange={this.onChange} tabIndex="-1" value={value} accept="image/*" disabled={environment !== 'development'} />
        <div className={`upload-file__image upload-file__image--placeholder ${mode === 'placeholder' ? 'active' : ''}`}>
          {(type === 'front' && gender === 'male') ? (
            <svg width="122px" height="375px" viewBox="0 0 122 375" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-126.000000, -121.000000)" stroke="#000000" strokeWidth="2">
                  <path d="M237.308682,203.538938 C234.143522,196.75197 229.443559,193.899534 221.727735,191.637874 C218.731782,190.760661 215.845315,189.567173 213.02255,188.232455 C211.045818,187.297557 209.214405,187.096653 207.255589,186.49792 C205.567504,185.980742 204.826976,185.417813 203.232452,184.220347 C200.497276,182.167548 198.524525,179.400645 197.507295,174.654541 C199.095846,173.413314 200.30219,171.849845 201.172112,170.085472 C201.172112,170.083483 201.174102,170.081494 201.176093,170.079504 C201.522469,169.371368 201.819078,168.635384 202.065921,167.87553 C202.099762,167.768116 202.127632,167.644789 202.155501,167.52544 C202.47998,166.188734 202.535718,164.078249 203.463369,163.234851 C203.925204,162.815141 204.51046,162.554563 205.008126,162.176625 C206.706165,160.875723 206.747969,160.446068 207.014718,158.325638 C207.142121,157.315151 208.645074,152.716244 207.365075,151.39744 C206.479229,150.486411 205.499821,151.365614 205.37839,150.72312 C205.25895,150.090571 205.491858,147.930358 205.655093,146.335062 C205.661065,146.263453 205.667037,146.199801 205.675,146.13217 C205.678981,146.096365 205.682962,146.058571 205.684953,146.024756 C205.742682,145.451881 205.786477,144.974486 205.790458,144.721865 C205.834253,142.474129 205.680972,140.079197 205.171361,137.783722 C205.722776,135.335082 205.410241,132.476679 203.174722,129.508872 C202.079856,128.054806 199.085893,124.87615 197.712333,124.24758 C195.365337,123.171451 192.701825,122.600566 190.1478,122.294238 C187.57785,121.983931 184.575924,121.804908 182.061712,122.351923 C179.698791,122.867112 177.069121,123.499661 174.957023,124.448483 C173.195283,125.240164 172.930525,126.620631 172.182034,128.205981 C171.885425,128.834551 171.4216,129.880843 170.874166,130.318455 C170.362565,130.730208 169.737496,130.565109 169.325428,131.187712 C168.31616,132.711398 168.246486,139.778836 168.246486,142.253334 C168.206673,143.084797 168.192738,143.912282 168.208664,144.721865 C168.22658,145.690579 168.79392,149.810101 168.622722,150.72312 C168.501292,151.365614 167.519893,150.486411 166.634046,151.39744 C165.354048,152.716244 166.858992,157.315151 166.986394,158.325638 C167.253144,160.446068 167.292957,160.875723 168.990996,162.176625 C169.488662,162.554563 170.073918,162.815141 170.535753,163.234851 C171.547012,164.153837 171.519142,166.588552 171.935192,167.87553 C172.79516,170.537008 174.264271,172.918016 176.491827,174.65852 C175.474597,179.400645 173.501846,182.167548 170.76667,184.220347 C169.174137,185.417813 168.431618,185.980742 166.743533,186.49792 C164.784717,187.096653 162.953304,187.297557 160.976572,188.232455 C158.153807,189.567173 155.26734,190.760661 152.271387,191.637874 C144.555563,193.899534 139.855599,196.75197 136.69243,203.538938 C133.654673,210.051404 130.033651,252.754401 130.035641,254.473023 C130.041613,257.932149 129.360805,262.89507 128.650137,266.193075 C126.948117,274.086008 126.504199,282.132106 127.593093,288.71817 C128.843232,296.261013 129.217477,308.408731 129.311039,311.973282 C129.358815,313.801307 129.048271,315.742714 128.594399,317.445424 C127.790169,320.478872 127.392036,323.902193 127.824011,327.054991 C128.626249,332.934908 130.109296,340.308674 130.642795,340.949179 C131.747614,342.279918 137.500641,346.085155 139.041417,346.288048 C140.584183,346.488952 143.400977,348.460196 144.147477,348.434337 C145.845515,348.374663 145.063183,345.438683 144.537647,344.650981 C143.691614,343.381905 142.371802,342.520605 141.296842,341.466357 C139.837683,340.03815 138.824434,338.892401 138.464124,336.909222 C138.167514,335.292046 138.121729,332.869266 138.117748,331.138708 C138.115757,330.442507 138.545741,328.296218 139.634636,328.938712 C140.331369,329.350466 140.399051,329.41014 140.540389,331.643952 C140.679735,333.877763 141.696966,339.751713 145.935095,338.108678 C147.388282,337.545749 147.035934,335.831105 146.295406,334.239788 C145.554878,332.648471 145.528999,331.90453 145.178642,330.796575 C144.828285,329.688621 144.649125,328.033651 144.583433,326.277234 C144.430151,322.227332 141.32073,318.951208 140.910653,318.38629 C138.84036,315.527887 141.587479,305.275825 144.00813,295.7319 C145.726075,288.9509 146.076433,284.419624 145.702187,277.387991 C145.509093,273.781669 144.748658,268.46468 145.407569,264.886205 C146.146106,260.874097 148.238296,255.033963 149.305294,248.782075 C150.710704,240.550987 152.765072,235.946113 152.404762,230.587352 C153.463796,241.824041 157.413279,251.481347 156.559283,260.826357 C155.510202,272.28782 157.686,275.575879 156.324384,282.842231 C155.601772,286.699186 154.351634,287.677846 153.187094,292.51744 C152.15991,296.790126 151.200408,304.730799 150.734592,310.907099 C149.74324,324.077238 150.232944,321.465489 149.988092,332.903081 C149.74324,344.340674 150.738574,357.200506 153.973407,371.96793 C157.20824,386.735353 157.490915,390.339687 156.336328,400.410736 C155.183732,410.479795 153.427964,418.116129 156.718536,431.335996 C160.009108,444.555864 164.032245,459.627627 165.037532,467.999945 C166.040828,476.370273 166.206053,479.363939 164.617501,482.033374 C163.026959,484.702808 158.34292,489.399183 158.231443,490.902978 C158.119965,492.408762 156.167122,494.726117 163.429073,494.726117 C170.852269,494.726117 172.160137,495.265176 173.688969,494.240766 C174.059233,493.992122 174.572825,494.010025 174.889341,494.322321 C175.398951,494.825575 176.26091,495.251252 178.092323,494.825575 C179.842119,494.419789 180.720003,493.178562 180.65033,491.012381 C180.606535,489.689599 180.700097,488.925766 180.960874,486.568628 C181.265446,483.803714 180.088962,481.456521 180.733938,478.005352 C181.655616,473.076247 179.376303,471.584387 179.539538,456.347525 C179.682866,443.185342 182.893811,431.881023 181.962179,424.039807 C181.030547,416.198591 177.415497,404.391018 177.901219,398.525025 C178.386942,392.659032 183.387496,388.58327 182.366284,368.584391 C181.87658,358.966868 184.118071,356.639567 184.900403,329.338531 C184.960123,327.285732 189.038999,327.285732 189.098719,329.338531 C189.881051,356.639567 192.124532,358.966868 191.632837,368.584391 C190.611625,388.58327 195.61218,392.659032 196.099893,398.525025 C196.585616,404.391018 192.968575,416.198591 192.036943,424.039807 C191.105311,431.881023 194.316256,443.185342 194.459584,456.347525 C194.624809,471.584387 192.343505,473.076247 193.265184,478.005352 C193.91016,481.456521 192.733676,483.803714 193.040239,486.568628 C193.299025,488.925766 193.392587,489.689599 193.350783,491.012381 C193.279119,493.178562 194.158993,494.419789 195.908789,494.825575 C197.738212,495.251252 198.60017,494.825575 199.109781,494.322321 C199.426297,494.010025 199.939889,493.992122 200.310153,494.240766 C201.840976,495.265176 203.146853,494.726117 210.570049,494.726117 C217.832,494.726117 215.879156,492.408762 215.767679,490.902978 C215.656202,489.399183 210.972163,484.702808 209.383611,482.033374 C207.793069,479.363939 207.958294,476.370273 208.963581,467.999945 C209.968867,459.627627 213.990014,444.555864 217.282576,431.335996 C220.573148,418.116129 218.81738,410.479795 217.662794,400.410736 C216.508207,390.339687 216.790882,386.735353 220.025715,371.96793 C223.260548,357.200506 224.257872,344.340674 224.011029,332.903081 C223.766177,321.465489 224.257872,324.077238 223.26453,310.907099 C222.798714,304.730799 221.839212,296.790126 220.812028,292.51744 C219.649479,287.677846 218.39735,286.699186 217.674738,282.842231 C216.313122,275.575879 218.48892,272.28782 217.44183,260.826357 C216.587834,251.481347 220.535326,241.824041 221.59436,230.587352 C221.23405,235.946113 223.288418,240.550987 224.693828,248.782075 C225.760825,255.033963 227.853016,260.874097 228.591553,264.886205 C229.252455,268.46468 228.490029,273.781669 228.298925,277.387991 C227.922689,284.419624 228.273047,288.9509 229.992983,295.7319 C232.413633,305.275825 235.160753,315.527887 233.088469,318.38629 C232.680382,318.951208 229.570961,322.227332 229.41768,326.277234 C229.349997,328.033651 229.170837,329.688621 228.822471,330.796575 C228.472113,331.90453 228.444244,332.648471 227.703716,334.239788 C226.963188,335.831105 226.612831,337.545749 228.066017,338.108678 C232.302156,339.751713 233.319386,333.877763 233.460724,331.643952 C233.602061,329.41014 233.667753,329.350466 234.364486,328.938712 C235.455372,328.296218 235.883365,330.442507 235.881374,331.138708 C235.877393,332.869266 235.831608,335.292046 235.536989,336.909222 C235.174688,338.892401 234.161438,340.03815 232.70228,341.466357 C231.62732,342.520605 230.309499,343.381905 229.461475,344.650981 C228.935939,345.438683 228.155597,348.374663 229.853636,348.434337 C230.598145,348.460196 233.414938,346.488952 234.957705,346.288048 C236.500472,346.085155 242.251507,342.279918 243.356327,340.949179 C243.889826,340.308674 245.372873,332.934908 246.177102,327.054991 C246.607086,323.902193 246.208953,320.478872 245.404723,317.445424 C244.952842,315.742714 244.642298,313.801307 244.690074,311.973282 C244.781645,308.408731 245.15589,296.261013 246.406029,288.71817 C247.496914,282.132106 247.051005,274.086008 245.348985,266.193075 C244.638317,262.89507 243.957509,257.932149 243.963481,254.473023 C243.967462,252.754401 240.344449,210.051404 237.308682,203.538938 Z" id="Fill-11" />
                </g>
              </g>
            </svg>
          ) : null}

          {(type === 'front' && gender === 'female') ? (
            <svg width="112px" height="375px" viewBox="0 0 112 375" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-132.000000, -121.000000)" stroke="#000000" strokeWidth="2">
                  <path d="M241.999904,316.408022 C242.122265,314.178623 241.231644,312.49602 241.263738,307.048165 C241.293827,301.60232 239.305977,281.813136 238.672112,272.009007 C238.038247,262.204878 235.61311,257.651597 235.236,250.571395 C234.860897,243.491193 230.542188,226.30331 231.133929,210.408037 C231.352573,204.544054 228.752923,200.722514 226.183361,198.543372 C222.031143,195.023374 217.253082,194.944973 212.878209,193.84133 C208.944633,192.850263 206.361031,190.763593 203.943918,190.118294 C202.746394,189.798659 200.674296,188.948312 199.891994,188.051727 C199.019427,187.052619 197.629336,185.645424 196.68255,178.76826 C198.251166,177.32287 199.647274,175.616143 200.766568,173.913437 C202.32716,171.541308 203.440436,169.424485 204.274892,167.197096 C204.680084,166.115566 205.452357,165.237074 206.405161,164.587754 C206.409172,164.583734 206.41519,164.579713 206.419202,164.577703 C208.401034,163.212724 208.449175,162.762421 208.76009,160.539053 C208.908527,159.477626 210.663692,154.656978 209.169294,153.273906 C208.154308,152.335106 207.041032,153.197515 206.866518,152.592421 C206.99289,149.440304 206.774247,146.30427 205.83749,143.341119 C203.9038,137.233892 201.68126,132.041342 195.083845,129.982817 C195.113934,129.031955 195.013639,128.075062 194.756883,127.178478 C194.165142,125.109901 192.80514,123.393123 191.138235,122.609114 C190.139295,122.138709 189.076167,122 188.001003,122 C186.925839,122 185.862711,122.138709 184.863771,122.609114 C183.19486,123.393123 181.836864,125.109901 181.245123,127.178478 C180.988367,128.075062 180.886066,129.031955 180.91816,129.982817 C174.320746,132.041342 172.0962,137.233892 170.16251,143.341119 C169.225753,146.30427 169.00711,149.440304 169.135488,152.592421 C168.960974,153.197515 167.845692,152.335106 166.830706,153.273906 C165.336308,154.656978 167.091473,159.477626 167.23991,160.539053 C167.550825,162.762421 167.598966,163.212724 169.580798,164.577703 C169.586816,164.579713 169.590828,164.583734 169.596845,164.587754 C170.549649,165.237074 171.319916,166.115566 171.725108,167.197096 C172.56157,169.424485 173.67284,171.541308 175.233432,173.913437 C176.352726,175.616143 177.748834,177.32287 179.319456,178.76826 C178.370664,185.645424 176.980573,187.052619 176.110012,188.051727 C175.32771,188.948312 173.253606,189.798659 172.058088,190.118294 C169.640975,190.763593 167.057373,192.850263 163.121791,193.84133 C158.746918,194.944973 153.968857,195.023374 149.818644,198.543372 C147.249083,200.722514 144.649433,204.544054 144.868077,210.408037 C145.457812,226.30331 141.141109,243.491193 140.764,250.571395 C140.38689,257.651597 137.961753,262.204878 137.327888,272.009007 C136.696029,281.813136 134.706173,301.60232 134.738268,307.048165 C134.768356,312.49602 133.877735,314.178623 134.002101,316.408022 C134.126467,318.635411 133.683163,318.392167 133.205758,322.567516 C132.728353,326.742865 133.089416,332.251029 134.208709,337.097811 C134.912781,340.145393 136.126352,342.129538 138.262639,344.198115 C138.61969,344.543883 140.394913,345.864636 142.202232,346.696892 C142.944416,347.036629 143.303472,346.61246 143.957397,346.68684 C144.70961,346.771272 145.728609,347.299975 146.097695,346.749159 C146.910086,345.53294 142.262409,341.70738 141.506184,340.173537 C140.751964,338.639695 140.822171,336.715858 141.151139,333.646162 C141.480107,330.578477 142.485064,328.019392 143.078811,329.470813 C143.423827,330.31312 143.349608,331.893199 143.03067,334.305534 C142.799991,336.048445 142.543235,338.020529 143.207189,339.007576 C144.25427,340.569562 145.554095,338.991493 145.744656,337.879809 C146.468787,333.650183 146.420645,333.081274 147.090617,330.908163 C148.294158,327.008222 148.205899,324.205894 146.559053,321.481966 C144.914212,318.760049 143.873149,317.125692 143.780877,313.856979 C143.690612,310.590276 143.225242,311.042589 143.804948,306.412917 C144.38666,301.783245 148.671268,291.43433 153.140419,277.183464 C157.611577,262.930588 156.127209,262.190806 156.371929,253.295323 C156.554466,246.693567 158.036828,236.583876 158.805089,228.580956 C158.927449,232.43265 160.022156,237.443867 161.286275,242.797647 C163.121791,250.571395 163.599081,262.58482 163.613123,268.722201 C163.627164,275.651632 160.30751,285.180353 158.353761,288.881276 C154.672929,295.858954 151.282953,304.477018 150.550799,312.906117 C149.275045,327.583162 151.329089,334.263318 154.510451,346.871786 C158.181253,361.418163 160.945387,376.921432 161.49701,384.765539 C161.940315,391.071784 158.279542,397.424264 158.279542,412.505375 C158.279542,430.619997 161.458898,430.843138 166.943036,471.911121 C168.034247,480.076873 165.847813,482.79276 164.610171,484.877419 C163.372529,486.962078 159.727804,490.626816 159.64155,491.802829 C159.55329,492.976832 158.032816,494.786082 163.68545,494.786082 C169.530651,494.786082 172.533487,495.216282 173.718976,494.377996 C173.989772,494.187019 174.374906,494.235266 174.611602,494.470469 C175.006765,494.862473 175.678742,495.196179 177.104939,494.864483 C178.466947,494.546859 179.148954,493.577905 179.094795,491.887261 C179.0627,490.853977 179.134913,490.256925 179.337509,488.41752 C179.574206,486.25848 178.659514,485.432256 179.16099,482.738482 C179.879103,478.890809 173.67284,475.87137 181.136804,439.573778 C185.276987,419.444857 181.560049,414.083444 180.276272,406.158925 C178.553201,395.502438 179.259279,390.921013 181.590138,378.658313 C182.603119,373.337105 188.001003,344.198115 186.318166,328.527993 C186.318166,328.527993 186.709202,327.472596 188.001003,327.472596 C189.292804,327.472596 189.681834,328.527993 189.681834,328.527993 C188.001003,344.198115 193.398887,373.337105 194.409862,378.658313 C196.742727,390.921013 197.448805,395.502438 195.723728,406.158925 C194.441957,414.083444 190.725019,419.444857 194.865202,439.573778 C202.329166,475.87137 196.120897,478.890809 196.83901,482.738482 C197.340486,485.432256 196.425794,486.25848 196.664497,488.41752 C196.865087,490.256925 196.939306,490.853977 196.905205,491.887261 C196.851046,493.577905 197.535059,494.546859 198.895061,494.864483 C200.321258,495.196179 200.993235,494.862473 201.388398,494.470469 C201.625094,494.235266 202.010228,494.187019 202.28303,494.377996 C203.466513,495.216282 206.469349,494.786082 212.31455,494.786082 C217.967184,494.786082 216.44671,492.976832 216.360456,491.802829 C216.272196,490.626816 212.627471,486.962078 211.389829,484.877419 C210.154193,482.79276 207.967759,480.076873 209.056964,471.911121 C214.541102,430.843138 217.722464,430.619997 217.722464,412.505375 C217.722464,397.424264 214.059685,391.071784 214.50299,384.765539 C215.056619,376.921432 217.820753,361.418163 221.491555,346.871786 C224.672917,334.263318 226.726961,327.583162 225.449201,312.906117 C224.717047,304.477018 221.327071,295.858954 217.646239,288.881276 C215.694496,285.180353 212.372836,275.651632 212.386877,268.722201 C212.400919,262.58482 212.878209,250.571395 214.71573,242.797647 C215.979819,237.449846 217.072551,232.43265 217.194911,228.580956 C217.963172,236.583876 219.445534,246.693567 219.628071,253.295323 C219.874797,262.190806 218.390429,262.930588 222.859581,277.183464 C227.328732,291.43433 231.61334,301.783245 232.195052,306.412917 C232.774758,311.042589 232.311394,310.590276 232.219123,313.856979 C232.128857,317.125692 231.085788,318.760049 229.440947,321.481966 C227.794101,324.205894 227.705842,327.008222 228.909383,330.908163 C229.581361,333.081274 229.531213,333.650183 230.255344,337.879809 C230.445905,338.991493 231.74573,340.569562 232.794817,339.007576 C233.456765,338.020529 233.200009,336.048445 232.96933,334.305534 C232.652398,331.893199 232.578179,330.31312 232.923195,329.470813 C233.516942,328.019392 234.519893,330.578477 234.848861,333.646162 C235.177829,336.715858 235.250042,338.639695 234.493816,340.173537 C233.737591,341.70738 229.09192,345.53294 229.904311,346.749159 C230.271391,347.299975 231.29039,346.771272 232.042603,346.68684 C232.698533,346.61246 233.05759,347.036629 233.797768,346.696892 C235.605087,345.864636 237.38031,344.543883 237.737361,344.198115 C239.873648,342.129538 241.087219,340.145393 241.791291,337.097811 C242.910584,332.251029 243.271647,326.742865 242.794242,322.567516 C242.316837,318.392167 241.875538,318.635411 241.999904,316.408022 Z" id="Fill-6" />
                </g>
              </g>
            </svg>
          ) : null}

          {(type === 'side' && gender === 'female') ? (
            <svg width="62px" height="375px" viewBox="0 0 62 375" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-162.000000, -121.000000)" stroke="#000000" strokeWidth="2">
                  <path d="M210.528507,253.852219 C213.297877,235.121007 222.072915,227.202757 217.979239,208.06548 C217.532437,205.970833 216.954814,203.904329 216.377191,201.841845 C215.809631,199.811525 215.234021,197.763112 214.235759,195.905671 C213.225423,194.030137 211.810548,192.409901 210.611025,190.64895 C207.018492,185.380168 202.965068,177.496093 205.134676,170.987006 C206.118849,168.040027 208.157637,168.120435 211.95747,163.919079 C220.136771,154.877118 221.827375,145.250183 216.854183,137.372138 C216.64487,137.042462 216.415431,136.710776 216.173916,136.37909 C219.245179,135.492584 221.521456,132.678279 221.565734,129.335286 C221.618062,125.284696 218.371701,122 214.314252,122 C210.272904,122 206.954088,125.260574 206.877608,129.293071 C202.657137,127.62459 197.361925,127.019515 191.020148,128.555321 C187.286732,129.457909 182.315552,131.102268 179.986947,133.062231 C178.753209,134.101513 179.481778,135.08451 178.805537,136.385121 C176.559449,140.70106 175.062057,146.060301 175.005704,147.453382 C174.909098,149.849562 176.189126,151.783392 174.776265,154.264001 C173.280886,156.891357 172.103501,157.795955 170.306228,160.708761 C168.510968,163.621567 172.506026,163.46075 172.733452,164.053764 C173.578754,166.242891 172.246397,167.260062 172.268536,168.233007 C172.310801,170.178899 174.102036,169.73062 174.102036,169.73062 C173.148052,170.056275 172.139728,171.312662 173.407681,172.181076 C174.597141,172.995214 175.512885,172.500701 174.17449,176.354289 C172.373192,181.544672 184.805167,178.378579 186.087208,179.208799 C188.522483,180.78883 188.580849,180.623992 190.132581,186.548105 C190.655864,188.548272 190.937631,189.776515 190.786684,191.099239 C190.106417,197.103761 188.657328,197.736979 185.197629,200.96539 C181.637298,204.290291 177.95621,211.9246 175.126187,216.639061 C171.245866,223.103187 165.82732,233.341963 166.300286,236.009523 C167.678933,243.799118 173.524413,245.093699 177.762998,243.861435 C177.702619,245.091689 177.636203,249.876008 177.95621,254.951809 C178.278229,260.025599 182.44436,264.345558 179.890341,281.649516 C176.740585,302.996023 177.461104,305.305763 177.726771,314.556787 C177.80325,317.194194 177.547647,316.394127 176.607752,321.186487 C174.011468,334.431814 174.42003,346.448898 177.155186,360.832009 C179.644801,373.932601 182.414171,381.872963 185.024543,389.083615 C185.618267,390.723953 185.569964,391.52603 185.105048,392.985449 C182.657698,400.64639 184.249683,405.376434 187.86033,409.702423 C189.208787,411.316628 188.780098,418.364453 189.184636,421.828059 C192.535654,450.546036 191.481039,465.906113 190.319755,474.793287 C189.975597,477.422652 187.290757,480.894299 184.89171,483.013069 C181.667487,485.857528 175.26332,486.818412 172.314826,487.751153 C171.040836,488.153197 169.929868,488.866824 168.929594,488.864814 C167.587174,488.858784 166.629165,488.991458 166.170287,489.108051 C164.556163,489.514115 163.153365,490.225732 163.006443,492.05503 C162.861534,493.884329 165.178064,494.825111 168.229201,494.927632 C171.28235,495.028143 183.309788,494.774856 186.745336,493.910462 C197.675894,491.160483 198.090494,495 202.977144,495 C204.82272,495 208.53601,493.8984 209.153885,492.380686 C210.174285,489.877964 207.509572,485.159982 207.076858,483.519644 C204.353778,473.229337 203.623196,472.260412 206.006142,462.488742 C209.868367,446.648223 212.349931,444.197767 213.283789,424.061411 C213.879525,411.208076 211.061852,408.120381 209.010989,402.907886 C208.501795,401.613305 208.600414,399.140737 208.250217,397.401898 C207.942286,395.878153 207.161388,395.160505 207.066795,393.031684 C206.984277,391.113936 208.254243,389.045421 208.890232,386.769854 C214.392744,367.027502 213.380395,351.122656 212.575345,338.146697 C212.343893,334.411712 215.616419,331.691887 216.419456,330.513899 C220.825089,324.045017 224.145917,315.996104 222.563995,308.393458 C220.227339,297.178451 211.291291,287.625895 209.910632,276.24806 C209.413514,272.145205 209.92472,257.941003 210.528507,253.852219 Z" id="Fill-8" />
                </g>
              </g>
            </svg>
          ) : null}

          {(type === 'side' && gender === 'male') ? (
            <svg width="65px" height="375px" viewBox="0 0 65 375" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-160.000000, -121.000000)" stroke="#000000" strokeWidth="2">
                  <path d="M220.689439,489.030138 C220.130307,488.926695 218.970107,488.839166 217.356611,488.946588 C216.15248,489.02417 214.764634,488.252325 213.205054,487.864414 C209.592661,486.967243 205.257389,485.262421 201.379407,481.84283 C193.625441,475.003648 190.308588,468.926364 192.728832,451.217697 C195.149076,433.509029 199.694023,417.359966 197.385605,407.345875 C196.998206,405.670892 201.157751,401.232784 201.658973,396.2516 C202.280009,390.082809 199.334581,386.774618 200.448851,385.471633 C201.565119,384.168647 206.191938,373.442391 212.881556,344.293311 C217.194862,325.496501 212.488167,313.827321 215.183983,305.786607 C216.669678,301.360435 217.336642,298.897693 217.999614,290.608318 C218.748451,281.25865 217.334646,277.845027 217.799923,272.963307 C218.496842,265.658631 219.962567,260.760997 220.457799,255.447601 C220.967008,249.990976 222.225056,246.722571 221.959468,241.029221 C221.795722,237.476347 221.697874,237.014832 220.861173,233.012378 C220.016484,228.974118 225.220407,228.359427 219.764874,216.823529 C212.492161,201.4483 198.25226,189.741323 196.894368,188.987382 C195.915886,188.444305 195.873951,186.401303 196.676705,184.664652 C197.012185,183.940551 197.4535,183.01553 197.48545,182.044756 C197.523391,180.894946 196.536922,178.074132 197.689134,178.452097 C204.274913,180.612467 207.639692,180.719889 208.933683,180.04154 C210.533201,179.20206 211.020445,178.101982 210.265616,174.025925 C209.972072,172.438471 210.888649,172.989504 211.479732,171.901362 C212.204607,170.564559 210.559161,170.172668 210.559161,170.172668 C210.559161,170.172668 211.523664,170.36563 211.951001,169.836478 C212.354375,169.335177 212.518121,168.636936 211.869128,167.703958 C211.333958,166.938081 211.21015,165.9315 211.385878,164.3898 C211.439794,163.910381 215.351723,164.511146 215.014247,162.19959 C214.674774,159.888034 211.990939,157.455132 210.988494,155.241051 C209.984053,153.024981 212.490164,149.223446 212.25453,147.295823 C212.020892,145.372179 210.119843,137.995888 207.631704,135.517232 C207.346147,135.232763 207.162432,134.880659 207.73754,134.234139 C209.650571,132.079737 202.79521,122 189.937165,122 C182.672439,122 176.553935,124.277738 172.182719,128.59251 C169.858326,130.886162 167.537927,133.61547 166.785095,137.162375 C164.612467,147.38733 167.328252,155.845795 171.587642,162.62132 C172.773801,164.509157 173.362887,163.920327 173.686385,164.497221 C176.294338,169.152162 176.174524,170.958438 175.615391,176.496624 C174.986368,182.723105 173.660425,182.028842 169.133451,189.866648 C167.308283,193.027631 163.833676,196.433297 162.328013,201.313028 C161.525258,203.91701 161.004067,208.932012 161,212.564457 C160.992086,219.011749 161.629097,225.381459 166.291861,236.702513 C172.773801,252.439793 174.549046,262.927335 175.271924,269.987328 C175.900948,276.148162 176.977278,287.180769 174.503117,290.831118 C172.354452,294.006027 167.575868,303.500912 167.300296,308.941623 C167.092618,313.04553 167.238392,313.749739 168.41257,318.406669 C171.188262,329.425351 176.517991,332.42918 174.746739,341.4904 C172.458291,353.18942 168.680154,357.430588 175.046275,384.544623 C176.098641,389.032463 173.816184,389.613336 173.450751,394.962539 C173.087315,400.311743 173.792221,400.972187 172.566124,403.870584 C170.020075,409.888189 166.333796,424.169308 170.850786,444.718683 C174.642901,461.967825 177.90983,467.309071 175.920917,482.453542 C175.655329,484.476651 173.436772,488.843145 174.66287,491.850953 C175.40372,493.675132 178.61873,495 180.839284,495 C186.724151,495 188.784953,491.27008 196.616798,493.689057 C200.690476,494.948278 214.023784,495.033818 217.698082,494.910482 C221.374376,494.789135 224.166044,493.657229 223.992313,491.459062 C223.82058,489.260896 222.658383,489.398157 220.689439,489.030138" id="Fill-9" transform="translate(192.500000, 308.500000) scale(-1, 1) translate(-192.500000, -308.500000) " />
                </g>
              </g>
            </svg>
          ) : null}
        </div>
        <div className={`upload-file__image upload-file__image--preview ${mode === 'preview' ? 'active' : ''}`}>
          <img src={file} alt={`${fileText} preview`} />
        </div>
      </label>
    );
  }
}