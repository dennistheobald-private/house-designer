"""
Photo-realistic renders of House K in Blender Cycles, from a package exported by the
House Designer app ("Render in Blender"). Needs no editing: the starters next to this file
run it as

    blender --background --python render_house.py

It imports scene/house.glb, lights it like the app's day or evening, and renders
scene/job.json: a photo of every room into renders/photos and the video into renders.
Run it again after an interruption and it carries on where it stopped.

Options after `--`:  --quality preview|final   --only photos|video
"""

import json
import math
import os
import sys
import time

import bpy
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'renders')

# Resolution and samples per pixel. The denoiser clears what grain is left.
QUALITY = {
    'preview': {'photo': (1280, 720), 'photo_samples': 128, 'video': (960, 540), 'video_samples': 24},
    'final': {'photo': (1920, 1080), 'photo_samples': 512, 'video': (1920, 1080), 'video_samples': 96},
}

# The app is y-up with the plan's x and y as x and z; Blender is z-up: (x, y, z) -> (x, -z, y).
AXES = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))

# Lamps in the app are dim on purpose (its exposure makes up for it); this makes them read
# like warm 2700 K bulbs of about 40 W.
LAMP_WATTS = 45.0


def log(*parts):
    print('[house-k]', *parts, flush=True)


def options():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    opts = {}
    for i, a in enumerate(argv):
        if a.startswith('--') and i + 1 < len(argv):
            opts[a[2:]] = argv[i + 1]
    return opts


def position(p):
    return AXES @ Vector(p)


def rotation(q):
    x, y, z, w = q
    # A camera looks down its -z with y up in both programs, so only the world axes change.
    return (AXES @ Quaternion((w, x, y, z)).to_matrix()).to_quaternion()


# ---------------------------------------------------------------- scene


def load_model():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    log('Loading the house…')
    bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, 'scene', 'house.glb'))
    log(f'{len([o for o in bpy.data.objects if o.type == "MESH"])} pieces loaded')


def base_name(block):
    return block.name.split('.')[0]


def clear_glass(mat):
    """Window glass as an architect's render has it: clear, letting the sun through, with
    reflections that grow towards grazing angles."""
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    mix = nt.nodes.new('ShaderNodeMixShader')
    clear = nt.nodes.new('ShaderNodeBsdfTransparent')
    gloss = nt.nodes.new('ShaderNodeBsdfGlossy')
    gloss.inputs['Roughness'].default_value = 0.0
    fresnel = nt.nodes.new('ShaderNodeFresnel')
    fresnel.inputs['IOR'].default_value = 1.52
    clear.inputs['Color'].default_value = (0.94, 0.97, 0.97, 1)
    nt.links.new(fresnel.outputs['Fac'], mix.inputs['Fac'])
    nt.links.new(clear.outputs['BSDF'], mix.inputs[1])
    nt.links.new(gloss.outputs['BSDF'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    if hasattr(mat, 'surface_render_method'):
        mat.surface_render_method = 'DITHERED'


def fix_materials():
    for mat in bpy.data.materials:
        if not mat.node_tree:
            continue
        if base_name(mat) == 'glass':
            clear_glass(mat)
            continue
        # The app's bump maps are made for its softer real-time light; under path tracing
        # they read as carved, so ease them off.
        for node in mat.node_tree.nodes:
            if node.type == 'NORMAL_MAP':
                node.inputs['Strength'].default_value *= 0.4


def fix_lamps():
    lamps = [o for o in bpy.data.objects if o.type == 'LIGHT' and o.data.type in ('POINT', 'SPOT')]
    if not lamps:
        return
    # The importer turns the lamps' candela into watts; scale them so the brightest reads as a real bulb.
    reference = max(o.data.energy for o in lamps) or 1
    for o in lamps:
        o.data.energy = LAMP_WATTS * o.data.energy / reference
        o.data.shadow_soft_size = 0.04
    log(f'{len(lamps)} lamps switched on')


def sky_node(nodes):
    sky = nodes.new('ShaderNodeTexSky')
    kinds = [e.identifier for e in sky.bl_rna.properties['sky_type'].enum_items]
    for kind in ('MULTIPLE_SCATTERING', 'NISHITA', 'SINGLE_SCATTERING', 'HOSEK_WILKIE'):
        if kind in kinds:
            sky.sky_type = kind
            break
    return sky


def light(job):
    scene = bpy.context.scene
    world = bpy.data.worlds.new('Sky')
    scene.world = world
    world.use_nodes = True
    nodes, links = world.node_tree.nodes, world.node_tree.links
    background = nodes['Background']
    sun_dir = position(job['sun']).normalized()

    if job['time'] == 'day':
        sky = sky_node(nodes)
        elevation = math.asin(max(-1.0, min(1.0, sun_dir.z)))
        if hasattr(sky, 'sun_disc'):
            sky.sun_disc = False
            sky.sun_elevation = elevation
            # Sky rotation is measured from -y, turning towards +x.
            sky.sun_rotation = math.atan2(sun_dir.x, -sun_dir.y)
        else:
            sky.sun_direction = sun_dir
        # Half the sky's blue, as a photographer's white balance would take out the cast it gives white walls.
        neutral = nodes.new('ShaderNodeHueSaturation')
        neutral.inputs['Saturation'].default_value = 0.5
        links.new(sky.outputs['Color'], neutral.inputs['Color'])
        links.new(neutral.outputs['Color'], background.inputs['Color'])
        background.inputs['Strength'].default_value = 1.0

        sun = bpy.data.lights.new('Sun', 'SUN')
        sun.energy = 4.5
        sun.angle = math.radians(0.6)
        sun.color = (1.0, 0.95, 0.88)
        obj = bpy.data.objects.new('Sun', sun)
        scene.collection.objects.link(obj)
        obj.rotation_mode = 'QUATERNION'
        obj.rotation_quaternion = (-sun_dir).to_track_quat('-Z', 'Y')
        scene.view_settings.exposure = 1.3
    else:
        # Blue hour: a deep blue sky outside, the house lit by its lamps.
        background.inputs['Color'].default_value = (0.05, 0.08, 0.16, 1)
        background.inputs['Strength'].default_value = 0.6
        scene.view_settings.exposure = 1.3


def settings(scene, resolution, samples):
    scene.render.engine = 'CYCLES'
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    c = scene.cycles
    c.samples = samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.02
    c.use_denoising = True
    c.max_bounces = 12
    c.diffuse_bounces = 6
    c.glossy_bounces = 4
    c.transmission_bounces = 8
    c.transparent_max_bounces = 16
    c.caustics_reflective = False
    c.caustics_refractive = False
    c.sample_clamp_indirect = 8
    c.seed = 0
    for view in ('AgX', 'Filmic'):
        try:
            scene.view_settings.view_transform = view
        except TypeError:
            continue
        # Look names differ between Blender versions.
        for look in (f'{view} - Medium High Contrast', 'Medium High Contrast'):
            try:
                scene.view_settings.look = look
                break
            except TypeError:
                pass
        break


def use_gpu(scene):
    """The fastest graphics card Cycles can use, or the processor."""
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
    except KeyError:
        return 'CPU'
    for kind in ('OPTIX', 'CUDA', 'HIP', 'METAL', 'ONEAPI'):
        try:
            prefs.compute_device_type = kind
        except TypeError:
            continue
        prefs.get_devices()
        gpus = [d for d in prefs.devices if d.type == kind]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == kind
            scene.cycles.device = 'GPU'
            return f'{kind} ({", ".join(d.name for d in gpus)})'
    scene.cycles.device = 'CPU'
    return 'CPU'


# ---------------------------------------------------------------- cameras


def camera(scene, fov):
    data = bpy.data.cameras.get('Render camera') or bpy.data.cameras.new('Render camera')
    data.sensor_fit = 'VERTICAL'
    data.angle_y = math.radians(fov)
    data.clip_start = 0.05
    data.clip_end = 400
    obj = bpy.data.objects.get('Render camera') or bpy.data.objects.new('Render camera', data)
    if obj.name not in scene.collection.objects:
        scene.collection.objects.link(obj)
    obj.rotation_mode = 'QUATERNION'
    scene.camera = obj
    return obj


def place(obj, pose):
    obj.location = position(pose['position'])
    obj.rotation_quaternion = rotation(pose['quaternion'])


def hide_parts(names):
    """Leaves whole floors, the roof or the surroundings out of a shot."""
    hidden = set()
    for name in names or []:
        group = bpy.data.objects.get(name)
        if group:
            hidden.update([group, *group.children_recursive])
    for o in bpy.data.objects:
        if o.type != 'CAMERA':
            o.hide_render = o in hidden


def done(path):
    return os.path.exists(path) and os.path.getsize(path) > 0


# ---------------------------------------------------------------- photos and video


def render_photos(scene, job, quality):
    shots = job['stills']
    if not shots:
        return []
    settings(scene, QUALITY[quality]['photo'], QUALITY[quality]['photo_samples'])
    folder = os.path.join(OUT, 'photos')
    os.makedirs(folder, exist_ok=True)
    scene.render.image_settings.file_format = 'PNG'
    written = []
    for i, shot in enumerate(shots, 1):
        path = os.path.join(folder, f'{i:02d}-{shot["id"]}-{job["time"]}.png')
        written.append(path)
        if done(path):
            log(f'Photo {i}/{len(shots)} {shot["name"]}: already there')
            continue
        cam = camera(scene, shot['fov'])
        place(cam, shot)
        hide_parts(shot.get('hide'))
        started = time.time()
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        log(f'Photo {i}/{len(shots)} {shot["name"]}: {time.time() - started:.0f} s')
    hide_parts([])
    return written


def render_video(scene, job, quality):
    video = job.get('video')
    if not video or not video['frames']:
        return None
    frames = video['frames']
    settings(scene, QUALITY[quality]['video'], QUALITY[quality]['video_samples'])
    # Keeps the scene loaded between frames, which saves most of the set-up time per frame.
    scene.render.use_persistent_data = True
    folder = os.path.join(OUT, 'video-frames', video['name'])
    os.makedirs(folder, exist_ok=True)
    # A frame that was interrupted leaves an empty placeholder: render it again.
    for f in os.listdir(folder):
        if f.endswith('.png') and os.path.getsize(os.path.join(folder, f)) == 0:
            os.remove(os.path.join(folder, f))

    cam = camera(scene, video['fov'])
    hide_parts(video.get('hide'))
    if cam.animation_data:
        cam.animation_data_clear()
    for i, pose in enumerate(frames, 1):
        place(cam, pose)
        cam.keyframe_insert('location', frame=i)
        cam.keyframe_insert('rotation_quaternion', frame=i)
    scene.frame_start, scene.frame_end = 1, len(frames)
    scene.render.fps = video['fps']
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(folder, 'frame_')
    scene.render.use_overwrite = False
    scene.render.use_placeholder = True

    left = sum(1 for i in range(1, len(frames) + 1) if not done(os.path.join(folder, f'frame_{i:04d}.png')))
    log(f'Video: {len(frames)} frames ({len(frames) / video["fps"]:.0f} s), {left} still to render')
    started = time.time()
    count = [0]

    def progress(_scene, *_):
        count[0] += 1
        per = (time.time() - started) / count[0]
        log(f'Video frame {count[0]}/{left}: about {per * (left - count[0]) / 60:.0f} min left')

    bpy.app.handlers.render_post.append(progress)
    try:
        if left:
            bpy.ops.render.render(animation=True)
    finally:
        bpy.app.handlers.render_post.remove(progress)
    return encode(video, folder, len(frames), QUALITY[quality]['video'], job['time'])


def encode(video, folder, count, resolution, time_of_day):
    """Joins the frames into an MP4 with Blender's own video editor."""
    path = os.path.join(OUT, f'{video["name"]}-{time_of_day}.mp4')
    scene = bpy.data.scenes.new('Encode')
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.render.fps = video['fps']
    scene.frame_start, scene.frame_end = 1, count
    # The frames already carry their tone mapping.
    scene.view_settings.view_transform = 'Standard'
    editor = scene.sequence_editor_create()
    strips = editor.strips if hasattr(editor, 'strips') else editor.sequences
    names = [f'frame_{i:04d}.png' for i in range(1, count + 1)]
    strip = strips.new_image('frames', os.path.join(folder, names[0]), 1, 1)
    for name in names[1:]:
        strip.elements.append(name)
    image = scene.render.image_settings
    if hasattr(image, 'media_type'):
        image.media_type = 'VIDEO'
    image.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
    scene.render.use_sequencer = True
    scene.render.filepath = path
    log('Joining the frames into a video…')
    with bpy.context.temp_override(scene=scene):
        bpy.ops.render.render(animation=True, scene=scene.name)
    # Blender may add the frame range to the name.
    produced = [f for f in os.listdir(OUT) if f.startswith(os.path.basename(path)[:-4]) and f.endswith('.mp4')]
    if produced and not os.path.exists(path):
        os.replace(os.path.join(OUT, produced[0]), path)
    return path


def main():
    opts = options()
    with open(os.path.join(HERE, 'scene', 'job.json'), encoding='utf-8') as f:
        job = json.load(f)
    quality = opts.get('quality', job.get('quality', 'final'))
    only = opts.get('only')
    log(f'{job["house"]}: {job["time"]}, {quality} quality')
    started = time.time()

    load_model()
    fix_materials()
    fix_lamps()
    light(job)
    scene = bpy.context.scene
    log(f'Rendering on {use_gpu(scene)}')
    os.makedirs(OUT, exist_ok=True)

    photos = render_photos(scene, job, quality) if only in (None, 'photos') else []
    movie = render_video(scene, job, quality) if only in (None, 'video') else None

    log(f'Finished in {(time.time() - started) / 60:.0f} min.')
    if photos:
        log(f'Photos: {os.path.dirname(photos[0])}')
    if movie:
        log(f'Video: {movie}')


if __name__ == '__main__':
    main()
