import {Game} from "./game";
import $ from "jquery";

Game.preloadResources();
$(() => Game.run());
