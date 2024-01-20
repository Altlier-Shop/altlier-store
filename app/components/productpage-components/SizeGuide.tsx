import XMarkIcon from '../svg-components/XMarkIcon';

interface SizeGuideProps {
  onClose: () => void;
}

export default function SizeGuide(props: SizeGuideProps) {
  return (
    <div className="fixed top-0 bg-black bg-opacity-40 h-screen w-full  flex items-center justify-center">
      <div className="relative bg-root-secondary lg:p-12 p-6 lg:max-w-3/4 max-w-full overflow-x-auto">
        <h2 className="pixel-font text-2xl md:text-4xl">Size Guide</h2>
        <h3 className="text-sm text-root-tertiary">
          All measurements are in centimeters (CM)
        </h3>
        <div className="max-w-fit overflow-x-scroll">
          <table className="sizing-guide-table mt-6 ">
            <thead>
              <tr>
                <th>Size</th>
                <th>Length</th>
                <th>Shoulder</th>
                <th>Sleeve</th>
                <th>Chest</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>L1</td>
                <td>73</td>
                <td>51</td>
                <td>23</td>
                <td>106</td>
              </tr>
              <tr>
                <td>L2</td>
                <td>75</td>
                <td>54</td>
                <td>25</td>
                <td>114</td>
              </tr>
              <tr>
                <td>L3</td>
                <td>77</td>
                <td>56</td>
                <td>27</td>
                <td>122</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button onClick={props.onClose} className="absolute top-6 right-6">
          <div className="w-8 h-8 flex items-center justify-center bg-root-tertiary active:bg-neutral-400 border-2 retro-border">
            <XMarkIcon />
          </div>
        </button>
      </div>
    </div>
  );
}
