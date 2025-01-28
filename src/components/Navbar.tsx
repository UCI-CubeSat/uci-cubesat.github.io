

const Navbar = ({
    route
}: { route: string }) => {
    return ( 
        <div className="flex flex-row items-center justify-between w-screen bg-black text-white p-5 px-7">
            <img src="/cs-logo.png" className="h-10 mb-1" />
            <div className="flex flex-row items-center justify-center gap-x-3">
                <a href="/" className={`${route === "/" && "underline"}`}>Home</a>
                <a href="/about">About</a>
            </div>
        </div>
     );
}
 
export default Navbar;