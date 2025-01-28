

const Footer = () => {
    return ( 
        <div className="flex flex-col gap-y-2 text-xs text-neutral-500 items-center justify-center w-screen bg-black p-5 px-7">
            <span>
                UCI CubeSat - University of California, Irvine - ICF 103, Irvine, CA, 92697
            </span>
            <div className="flex flex-row gap-x-2">
            <a href="https://uci.edu/privacy/" className="underline hover:text-white">Privacy Notice</a> /
            <a href="https://uci.edu/copyright/" className="underline hover:text-white">© 2025 UC Regents</a>
            </div>
        </div>
     );
}
 
export default Footer;