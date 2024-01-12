import { SVGAttributes } from "react";
import tnelogo from "../Components/images/tnelogo.png";

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <div>
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="316"
                height="316"
                viewBox="0 0 316 316"
            >
                <image width="316" height="316" xlinkHref={tnelogo} />
            </svg>
        </div>
    );
}
